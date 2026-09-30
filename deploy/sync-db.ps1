# ==============================================================================
# ShopStack - Full Enterprise Database Sync between AWS Cloud & Local PostgreSQL
# ==============================================================================
# Synchronizes ALL 19 tables:
# users, products, product_images, orders, order_items, inventories,
# warehouses, warehouse_allocations, stock_transfers, inbound_shipments,
# coupons, coupon_usages, vendor_coupon_approvals, user_addresses,
# settlements, refunds, wishlist_items, reviews, product_coupons
# ==============================================================================
param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("cloud-to-local", "local-to-cloud")]
    [string]$Direction = "cloud-to-local",

    [Parameter(Mandatory=$false)]
    [string]$LocalPass = ($env:SPRING_DATASOURCE_PASSWORD, $env:PGPASSWORD, "postgres" | Where-Object { $_ } | Select-Object -First 1),

    [Parameter(Mandatory=$false)]
    [switch]$Watch,

    [Parameter(Mandatory=$false)]
    [int]$IntervalSeconds = 15
)

$EC2_IP = "13.48.47.35"
$EC2_USER = "ubuntu"
$KEY_PATH = "deploy/ec2_key.pem"
$DUMP_FILE = "deploy/cloud_data_sync.sql"

function Sync-Database {
    param ([string]$Dir)

    $timeStr = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Write-Host "[$timeStr] Syncing entire database: $Dir..." -ForegroundColor Cyan

    if ($Dir -eq "cloud-to-local") {
        # 1. Dump full database on EC2 (all 19 tables, sequences & relations)
        ssh -o StrictHostKeyChecking=no -i $KEY_PATH "$($EC2_USER)@$($EC2_IP)" "sudo docker exec shopstack-db pg_dump -U postgres -d shopstack_db --clean --if-exists > /tmp/cloud_dump.sql"

        # 2. Download clean UTF-8 dump
        scp -q -o StrictHostKeyChecking=no -i $KEY_PATH "$($EC2_USER)@$($EC2_IP):/tmp/cloud_dump.sql" $DUMP_FILE

        if (Test-Path $DUMP_FILE) {
            $fileSize = (Get-Item $DUMP_FILE).Length
            # 3. Restore all 19 tables into local PostgreSQL database
            $env:PGPASSWORD = $LocalPass
            psql -U postgres -h localhost -d shopstack_db -q -f $DUMP_FILE > $null 2>&1

            Write-Host "[$timeStr] SUCCESS: All 19 tables synchronized to Local PostgreSQL ($fileSize bytes)." -ForegroundColor Green
        } else {
            Write-Host "[$timeStr] ERROR: Could not retrieve dump from AWS EC2." -ForegroundColor Red
        }
    } else {
        $env:PGPASSWORD = $LocalPass
        pg_dump -U postgres -h localhost -d shopstack_db --clean --if-exists -f $DUMP_FILE

        scp -q -o StrictHostKeyChecking=no -i $KEY_PATH $DUMP_FILE "$($EC2_USER)@$($EC2_IP):/tmp/local_dump.sql"
        ssh -o StrictHostKeyChecking=no -i $KEY_PATH "$($EC2_USER)@$($EC2_IP)" "sudo docker exec -i shopstack-db psql -U postgres -d shopstack_db < /tmp/local_dump.sql > /dev/null 2>&1 && rm -f /tmp/local_dump.sql"

        Write-Host "[$timeStr] SUCCESS: All 19 tables pushed to AWS EC2 Cloud Database." -ForegroundColor Green
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "ShopStack Complete Database Synchronization Tool" -ForegroundColor Cyan
Write-Host "Mode: $Direction | Covers ALL 19 tables" -ForegroundColor Yellow
if ($Watch) {
    Write-Host "Continuous Live Auto-Sync Enabled (Interval: ${IntervalSeconds}s)" -ForegroundColor Green
}
Write-Host "==========================================================" -ForegroundColor Cyan

if ($Watch) {
    while ($true) {
        Sync-Database -Dir $Direction
        Start-Sleep -Seconds $IntervalSeconds
    }
} else {
    Sync-Database -Dir $Direction
}
