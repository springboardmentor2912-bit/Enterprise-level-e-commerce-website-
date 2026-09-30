#!/bin/sh
set -e

SSL_BASE="/etc/nginx/ssl"
mkdir -p "$SSL_BASE"

# Generate fallback self-signed cert if none exists
FALLBACK_DIR="$SSL_BASE/fallback"
mkdir -p "$FALLBACK_DIR"
if [ ! -f "$FALLBACK_DIR/fullchain.pem" ] || [ ! -f "$FALLBACK_DIR/privkey.pem" ]; then
    echo "Creating fallback self-signed SSL certificates for initial startup..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$FALLBACK_DIR/privkey.pem" \
        -out "$FALLBACK_DIR/fullchain.pem" \
        -subj "/CN=shopstack.local" 2>/dev/null || true
fi

# Copy all available certs to /etc/nginx/ssl/<domain>
DEFAULT_CERT_DIR="$FALLBACK_DIR"
for dir in /etc/letsencrypt/live/*; do
    if [ -d "$dir" ] && [ "$(basename "$dir")" != "active" ] && [ "$(basename "$dir")" != "fallback" ] && [ -f "$dir/fullchain.pem" ] && [ -f "$dir/privkey.pem" ]; then
        domain=$(basename "$dir")
        echo "Configuring SSL for domain: $domain"
        mkdir -p "$SSL_BASE/$domain"
        cp -L "$dir/fullchain.pem" "$SSL_BASE/$domain/fullchain.pem"
        cp -L "$dir/privkey.pem" "$SSL_BASE/$domain/privkey.pem"
        DEFAULT_CERT_DIR="$SSL_BASE/$domain"
    fi
done

# Copy active default
cp -L "$DEFAULT_CERT_DIR/fullchain.pem" "$SSL_BASE/fullchain.pem"
cp -L "$DEFAULT_CERT_DIR/privkey.pem" "$SSL_BASE/privkey.pem"

# Dynamically generate SNI server blocks for each domain
cat << 'EOF' > /etc/nginx/conf.d/domains.conf
# Dynamic SNI configurations for active certificates
EOF

for dir in "$SSL_BASE"/*; do
    if [ -d "$dir" ] && [ "$(basename "$dir")" != "fallback" ] && [ -f "$dir/fullchain.pem" ]; then
        domain=$(basename "$dir")
        cat << EOF >> /etc/nginx/conf.d/domains.conf

server {
    listen 443 ssl;
    server_name $domain;

    ssl_certificate /etc/nginx/ssl/$domain/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/$domain/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL_$domain:10m;
    ssl_session_timeout 10m;

    root /usr/share/nginx/html;
    index index.html index.htm;
    client_max_body_size 50M;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/json application/javascript application/xml+rss image/svg+xml;
    gzip_disable "MSIE [1-6]\.";

    location ^~ /api/ {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90s;
        proxy_connect_timeout 90s;
    }

    location ^~ /uploads/ {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 90s;
    }

    location ~* \.(?:css|js|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc|woff2|woff)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF
    fi
done

exec nginx -g "daemon off;"
