# 🔒 Security Setup Guide for Kanban Backend

## ⚠️ IMPORTANT: Environment Variables Security

This backend uses sensitive environment variables that should **NEVER** be committed to version control.

## 🚫 What's Hidden (.gitignore)

The following files are automatically ignored by git:
- `.env` (main environment file)
- `.env.*` (all environment variants)
- `*.env` (any file ending with .env)
- `uploads/*` (user uploaded files)
- `node_modules/` (dependencies)
- `*.log` (log files)

## 🔑 Environment Variables Setup

### 1. Copy the template:
```bash
cp .env.example .env
```

### 2. Fill in your actual values:
```env
# Database - Use your actual MongoDB connection string
MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/kanban-app

# JWT Secret - Generate a strong random key
JWT_SECRET=your-super-secure-random-jwt-secret-key

# Server Configuration
BASE_URL=http://localhost:5000
PORT=5000
```

## 🛡️ Security Best Practices

### JWT Secret Generation
Generate a strong JWT secret:
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 64

# Option 3: Online generator (use with caution)
# Visit: https://generate-random.org/encryption-key-generator
```

### Database Security
- ✅ Use MongoDB Atlas with authentication
- ✅ Whitelist only necessary IP addresses
- ✅ Use strong database passwords
- ✅ Enable MongoDB encryption at rest

### File Upload Security
- ✅ File size limits (currently 10MB)
- ✅ File type restrictions
- ✅ Sanitized file names
- ✅ Uploads stored outside web root

## 🚀 Production Deployment

### Environment Variables for Production:
```env
NODE_ENV=production
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
BASE_URL=https://your-domain.com
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com
```

### Additional Security Headers (Recommended):
```javascript
// Add to your Express app
app.use(helmet()); // Security headers
app.use(cors({ origin: process.env.CORS_ORIGIN })); // CORS protection
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // Rate limiting
```

## ⚡ Quick Setup Commands

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit environment file (use your preferred editor)
nano .env

# Start development server
npm run dev
```

## 🔍 Verification Checklist

Before deploying, ensure:
- [ ] `.env` file is not committed to git
- [ ] All environment variables are set
- [ ] JWT_SECRET is strong and unique
- [ ] Database connection works
- [ ] File uploads are working
- [ ] CORS is properly configured

## 🚨 Emergency Response

If you accidentally commit sensitive data:
1. **Immediately rotate all secrets** (JWT secret, database passwords)
2. **Remove the file from git history**: `git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all`
3. **Force push to overwrite history**: `git push origin --force --all`
4. **Update all deployment environments** with new secrets

---

**Remember: Security is everyone's responsibility! 🔐**
