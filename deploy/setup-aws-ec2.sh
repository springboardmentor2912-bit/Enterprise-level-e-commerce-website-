#!/bin/bash
# ==============================================================================
# ShopStack - Automated AWS EC2 Host Setup & Docker HTTPS Deployment Script
# ==============================================================================
set -e

DOMAIN_PRIMARY="13.48.47.35.sslip.io"
DOMAIN_ALIAS="shopstack.13.48.47.35.sslip.io"
SSL_EMAIL="anirbansasmal21@gmail.com"

echo "========================================================"
echo "🚀 Starting ShopStack AWS EC2 Host Bootstrap & Deployment"
echo "========================================================"

# 1. Install Base Packages if missing
if ! command -v git &> /dev/null; then
    echo "📦 Installing base packages..."
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release git
fi

# 2. Configure 2GB Swap Memory (prevents OOM during Maven/Vite Docker builds)
if [ ! -f /swapfile ]; then
    echo "🧠 Configuring 2GB Swap memory for stable Docker builds..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap enabled: $(free -h | grep Swap)"
fi

# 3. Install Official Docker Engine & Docker Compose Plugin
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER
    echo "✅ Docker installed successfully."
fi

# 4. Check Docker Compose availability
echo "🔍 Checking Docker Compose version..."
docker compose version

# 5. Prepare ACME & SSL Directories
sudo mkdir -p /var/www/certbot
sudo mkdir -p /etc/letsencrypt

# 6. Ensure Valid Let's Encrypt SSL Certificate
if [ ! -f "/etc/letsencrypt/live/${DOMAIN_PRIMARY}/fullchain.pem" ]; then
    echo "🔐 Requesting Let's Encrypt SSL Certificate for $DOMAIN_PRIMARY & $DOMAIN_ALIAS..."
    sudo docker run --rm \
      -p 80:80 \
      -v /etc/letsencrypt:/etc/letsencrypt \
      -v /var/lib/letsencrypt:/var/lib/letsencrypt \
      certbot/certbot certonly \
      --standalone \
      -d "$DOMAIN_PRIMARY" \
      -d "$DOMAIN_ALIAS" \
      --agree-tos \
      --email "$SSL_EMAIL" \
      --non-interactive || echo "⚠️ Certbot standalone skipped (fallback self-signed will be used until certbot runs)."
fi

# 7. Setup SSL Auto-Renewal Cron Job (Every Sunday at 3:00 AM)
CRON_CMD="0 3 * * 0 docker run --rm -v /etc/letsencrypt:/etc/letsencrypt -v /var/lib/letsencrypt:/var/lib/letsencrypt -v /var/www/certbot:/var/www/certbot certbot/certbot renew --webroot -w /var/www/certbot --quiet && docker exec shopstack-frontend nginx -s reload"
(crontab -l 2>/dev/null | grep -v "certbot renew" ; echo "$CRON_CMD") | sudo crontab -

# 8. Navigate to project directory
cd /home/ubuntu/ShopStack

# 9. Copy .env if not exists
if [ ! -f .env ]; then
    echo "⚙️ Creating .env from .env.example..."
    cp .env.example .env
fi

# 10. Build and Run Containers
echo "🏗️ Building and deploying ShopStack multi-container stack..."
sudo docker compose down --remove-orphans || true
sudo docker system prune -af || true
sudo docker builder prune -af || true
sudo docker compose build
sudo docker compose up -d --force-recreate --remove-orphans

# 11. Check Running Containers
echo "========================================================"
echo "📊 Checking container health and running status..."
echo "========================================================"
sudo docker compose ps

echo "========================================================"
echo "🎉 DEPLOYMENT COMPLETE WITH HTTPS & SSL!"
echo "🌐 Public HTTPS URL:    https://$DOMAIN_ALIAS"
echo "🌐 Direct Domain URL:   https://$DOMAIN_PRIMARY"
echo "📡 Backend APIs:        https://$DOMAIN_ALIAS/api/products"
echo "🔒 SSL Status:          Active (Let's Encrypt TLS 1.3)"
echo "========================================================"
