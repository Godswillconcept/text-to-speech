# Deployment Guide

This guide provides step-by-step instructions for deploying the Text-to-Speech API to a production environment.

## Prerequisites

- A server with Node.js (v14 or higher) and npm installed
- MySQL database (v5.7 or higher)
- PM2 (or another process manager) for running Node.js applications in production
- Nginx (or another reverse proxy)
- SSL certificate (recommended)
- Google Cloud account with Text-to-Speech and Generative AI APIs enabled

## 1. Server Setup

### 1.1 Update and Upgrade System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Node.js and npm

```bash
# Using NodeSource (for Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v
npm -v
```

### 1.3 Install MySQL

```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Log in to MySQL
sudo mysql

# Create a new database and user
CREATE DATABASE text_to_speech_prod;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON text_to_speech_prod.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 1.4 Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.5 Install PM2

```bash
sudo npm install -g pm2
```

## 2. Application Setup

### 2.1 Clone the Repository

```bash
# Create a directory for the app
sudo mkdir -p /var/www/text-to-speech-api
sudo chown -R $USER:$USER /var/www/text-to-speech-api

# Clone the repository
git clone <repository-url> /var/www/text-to-speech-api
cd /var/www/text-to-speech-api
```

### 2.2 Install Dependencies

```bash
npm install --production
```

### 2.3 Configure Environment Variables

Create a `.env` file based on the `.env.example` and update it with your production values:

```bash
cp .env.example .env
nano .env
```

Make sure to set:
- `NODE_ENV=production`
- Database credentials
- JWT secret
- Google Cloud credentials
- Other environment-specific settings

### 2.4 Run Database Migrations

```bash
NODE_ENV=production npx sequelize-cli db:migrate
```

## 3. Configure PM2

### 3.1 Create a PM2 Ecosystem File

Create a file called `ecosystem.config.js` in your project root:

```javascript
module.exports = {
  apps: [{
    name: 'text-to-speech-api',
    script: './index.js',
    instances: 'max',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=1024'
    }
  }]
};
```

### 3.2 Start the Application with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 4. Configure Nginx as a Reverse Proxy

### 4.1 Create an Nginx Configuration File

```bash
sudo nano /etc/nginx/sites-available/text-to-speech-api
```

Add the following configuration (update `your_domain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your_domain.com www.your_domain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    
    # Increase timeout for file uploads
    client_max_body_size 20M;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Serve static files directly
    location /uploads/ {
        alias /var/www/text-to-speech-api/public/uploads/;
        expires 30d;
        access_log off;
    }
}
```

### 4.2 Enable the Nginx Configuration

```bash
sudo ln -s /etc/nginx/sites-available/text-to-speech-api /etc/nginx/sites-enabled/
sudo nginx -t  # Test the configuration
sudo systemctl restart nginx
```

## 5. Set Up SSL with Let's Encrypt (Recommended)

### 5.1 Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

### 5.3 Set Up Auto-Renewal

```bash
sudo certbot renew --dry-run
```

## 6. Set Up Logging

### 6.1 Configure PM2 Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 6.2 Set Up Log Rotation for Application Logs

```bash
sudo nano /etc/logrotate.d/text-to-speech-api
```

Add the following configuration:

```
/var/www/text-to-speech-api/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 7. Set Up Monitoring (Optional)

### 7.1 Install PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 install pm2-server-monit
```

### 7.2 Set Up Uptime Monitoring

Consider using an external service like:
- [UptimeRobot](https://uptimerobot.com/)
- [Better Uptime](https://betterstack.com/better-uptime)
- [StatusCake](https://www.statuscake.com/)

## 8. Backup and Recovery

### 8.1 Database Backups

Create a backup script at `/usr/local/bin/backup-db.sh`:

```bash
#!/bin/bash

# Database credentials
DB_USER="app_user"
DB_PASS="secure_password"
DB_NAME="text_to_speech_prod"

# Backup directory
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > "$BACKUP_DIR/$DB_NAME-$DATE.sql.gz"

# Delete backups older than 30 days
find $BACKUP_DIR -name "$DB_NAME-*.sql.gz" -type f -mtime +30 -delete
```

Make it executable:

```bash
chmod +x /usr/local/bin/backup-db.sh
```

### 8.2 Set Up Daily Backups

```bash
sudo crontab -e
```

Add the following line to run the backup daily at 2 AM:

```
0 2 * * * /usr/local/bin/backup-db.sh
```

## 9. Security Hardening

### 9.1 Configure Firewall

```bash
# Install UFW if not already installed
sudo apt install ufw -y

# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Enable the firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 9.2 Secure MySQL

```bash
sudo mysql_secure_installation
```

### 9.3 Keep System Updated

Set up automatic security updates:

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 10. Scaling

### 10.1 Horizontal Scaling

For high-traffic applications, consider:
- Setting up a load balancer
- Using a CDN for static assets
- Implementing database replication
- Using a managed database service

### 10.2 Vertical Scaling

If your application requires more resources:
- Upgrade your server resources (CPU, RAM)
- Optimize database queries
- Implement caching with Redis or Memcached

## 11. Monitoring and Maintenance

### 11.1 Application Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-server-monit
pm2 monit
```

### 11.2 Log Monitoring

Consider using tools like:
- [Logrotate](https://linux.die.net/man/8/logrotate) for log rotation
- [GoAccess](https://goaccess.io/) for real-time web log analysis
- [ELK Stack](https://www.elastic.co/what-is/elk-stack) for advanced log management

### 11.3 Regular Maintenance

- Monitor disk space usage
- Review and rotate logs
- Update dependencies regularly
- Backup database and important files
- Test your backup and recovery procedures

## 12. Troubleshooting

### Common Issues and Solutions

1. **Application Not Starting**
   - Check PM2 logs: `pm2 logs`
   - Verify environment variables are set correctly
   - Check if the port is already in use

2. **Database Connection Issues**
   - Verify database credentials in `.env`
   - Check if MySQL is running: `sudo systemctl status mysql`
   - Check MySQL error logs: `sudo tail -f /var/log/mysql/error.log`

3. **File Upload Issues**
   - Check file permissions on the uploads directory
   - Verify `MAX_FILE_SIZE` in `.env`
   - Check Nginx/Apache client max body size settings

4. **Performance Issues**
   - Check server resources: `top`, `htop`, `free -m`
   - Enable query logging for slow queries in MySQL
   - Consider adding caching

## 13. Updating the Application

When you need to update the application:

```bash
# Pull the latest changes
cd /var/www/text-to-speech-api
git pull origin main

# Install new dependencies
npm install --production

# Run migrations if needed
NODE_ENV=production npx sequelize-cli db:migrate

# Restart the application
pm2 restart all

# Check logs for errors
pm2 logs
```

## Support

For additional support, please contact your system administrator or open an issue in the project repository.
