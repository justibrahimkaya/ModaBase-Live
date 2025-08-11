# 🌍 ModaBase Environment Variables Template

## 📋 Complete Environment Setup Guide

Copy this template to your `.env` file and fill in the values:

```env
# ========================================
# DATABASE CONFIGURATION
# ========================================
# PostgreSQL connection string
# Development: file:./dev.db (SQLite)
# Production: postgresql://username:password@host:port/database
DATABASE_URL="file:./dev.db"

# ========================================
# NEXT.JS CONFIGURATION
# ========================================
# Environment (development, production, test)
NODE_ENV="development"

# Next.js URL (development: http://localhost:3000, production: https://yourdomain.com)
NEXTAUTH_URL="http://localhost:3000"

# Next.js secret key (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here-minimum-32-characters"

# App URL for CORS and redirects
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Company information
NEXT_PUBLIC_COMPANY_NAME="ModaBase"
NEXT_PUBLIC_COMPANY_EMAIL="info@modabase.com.tr"
NEXT_PUBLIC_COMPANY_PHONE="+90 212 123 45 67"

# ========================================
# EMAIL CONFIGURATION (Gmail SMTP)
# ========================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="info@modabase.com.tr"
SMTP_PASS="your-app-password-here"
EMAIL_FROM="ModaBase <info@modabase.com.tr>"

# ========================================
# PAYMENT CONFIGURATION (PayTR)
# ========================================
# Test credentials (replace with production credentials)
PAYTR_MERCHANT_ID="test-merchant-id"
PAYTR_MERCHANT_KEY="test-merchant-key"
PAYTR_MERCHANT_SALT="test-merchant-salt"

# ========================================
# SECURITY CONFIGURATION
# ========================================
# Encryption key for sensitive data (32 characters)
ENCRYPTION_KEY="your-encryption-key-32-chars"

# JWT secret for token signing
JWT_SECRET="your-jwt-secret-key-here"

# ========================================
# ANALYTICS & MONITORING
# ========================================
# Google Analytics (optional)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Sentry error tracking (optional)
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"

# ========================================
# CLOUD STORAGE (optional)
# ========================================
# Cloudinary for image uploads
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# ========================================
# DEVELOPMENT TOOLS
# ========================================
# Enable bundle analyzer
# ANALYZE=true

# Enable debug logging
# DEBUG=true
```

## 🔧 Quick Setup Commands

### 1. Generate Secret Keys
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -hex 16

# Generate JWT_SECRET
openssl rand -base64 32
```

### 2. Database Setup
```bash
# Development (SQLite)
DATABASE_URL="file:./dev.db"

# Production (PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database"
```

### 3. Email Setup (Gmail)
1. Enable 2-Step Verification in Google Account
2. Generate App Password for "ModaBase"
3. Use the 16-character password in SMTP_PASS

### 4. Production Checklist
- [ ] Update DATABASE_URL to PostgreSQL
- [ ] Set NODE_ENV="production"
- [ ] Update NEXTAUTH_URL to your domain
- [ ] Update NEXT_PUBLIC_APP_URL to your domain
- [ ] Generate strong secret keys
- [ ] Configure Gmail App Password
- [ ] Set up PayTR production credentials

## 🚨 Security Notes

1. **Never commit .env files** to version control
2. **Use strong, unique secrets** for each environment
3. **Rotate secrets regularly** in production
4. **Use environment-specific values** for dev/staging/prod
5. **Validate all environment variables** on startup

## 📊 Environment Validation

The app validates these required variables on startup:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- SMTP_HOST
- SMTP_USER
- SMTP_PASS

Missing variables will cause startup errors with clear messages.