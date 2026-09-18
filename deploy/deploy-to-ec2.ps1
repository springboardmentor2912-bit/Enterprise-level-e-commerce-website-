# ==============================================================================
# ShopStack - One-Click Deploy to AWS EC2 from Windows PowerShell
# ==============================================================================
$EC2_IP = "13.48.47.35"
$EC2_USER = "ubuntu"
$KEY_PATH = "deploy/ec2_key.pem"
$REMOTE_DIR = "/home/ubuntu/ShopStack"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Deploying ShopStack to AWS EC2: $EC2_IP" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Ensure remote directory exists
Write-Host "Creating remote project folder on EC2..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no -i $KEY_PATH "$($EC2_USER)@$($EC2_IP)" "mkdir -p $REMOTE_DIR"

# 2. Archive local source code excluding node_modules, target, git
Write-Host "Preparing and transferring project files..." -ForegroundColor Yellow
$tempTar = "$env:TEMP\shopstack_deploy.tar.gz"
if (Test-Path $tempTar) { Remove-Item $tempTar -Force }

$envInclude = if (Test-Path .env) { ".env" } else { "" }

tar --exclude="node_modules" `
    --exclude="target" `
    --exclude=".git" `
    --exclude="dist" `
    --exclude="*.log" `
    --exclude="*.pem" `
    -czf $tempTar backend frontend docker-compose.yml .env.example deploy $envInclude

Write-Host "Uploading archive to AWS EC2..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no -i $KEY_PATH $tempTar "$($EC2_USER)@$($EC2_IP):/home/ubuntu/shopstack_deploy.tar.gz"
Remove-Item $tempTar -Force

# 3. Extract on remote server
Write-Host "Extracting files on EC2 host..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no -i $KEY_PATH "$($EC2_USER)@$($EC2_IP)" "tar -xzf /home/ubuntu/shopstack_deploy.tar.gz -C $REMOTE_DIR && rm /home/ubuntu/shopstack_deploy.tar.gz && chmod +x $REMOTE_DIR/deploy/setup-aws-ec2.sh"

# 4. Trigger Bootstrap & Docker Compose
Write-Host "Running Docker Compose build and startup on EC2..." -ForegroundColor Green
ssh -o StrictHostKeyChecking=no -i $KEY_PATH "$($EC2_USER)@$($EC2_IP)" "cd $REMOTE_DIR && bash deploy/setup-aws-ec2.sh"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "AWS EC2 DEPLOYMENT SUCCESSFUL WITH HTTPS & SSL!" -ForegroundColor Green
Write-Host "Storefront (HTTPS):  https://shopstack.$($EC2_IP).sslip.io" -ForegroundColor Yellow
Write-Host "Direct HTTPS URL:    https://$($EC2_IP).sslip.io" -ForegroundColor Yellow
Write-Host "Backend API Gateway: https://shopstack.$($EC2_IP).sslip.io/api/products" -ForegroundColor Yellow
Write-Host "HTTP Fallback:       http://$($EC2_IP) (Automatically redirects to HTTPS)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

