# Vercel Deployment Setup

## Environment Variables

Add these environment variables in Vercel Project Settings → Environment Variables:

### Required

```bash
# Database URL (PostgreSQL/MySQL for production, SQLite for preview)
DATABASE_URL="postgresql://user:password@host:5432/dbname"
# Or for SQLite: "file:./data/prod.db"

# Session Secret (generate with: openssl rand -base64 32) — WAJIB diset di production
SESSION_SECRET="your-super-secret-session-key-min-32-characters"

# Admin Email
NEXT_PUBLIC_ADMIN_EMAIL="admin@yourdomain.com"

# App URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Optional

```bash
# File upload limits
MAX_FILE_SIZE=10485760  # 10MB
```

## Build Configuration

### Build Command
```bash
npm run build
```

### Install Command
```bash
npm install
```

### Output Directory
```
.next
```

### Node.js Version
```
20.x
```

## Database Setup

### Option 1: PostgreSQL (Recommended for Production)

1. Create a PostgreSQL database (e.g., on Vercel Postgres, Supabase, Railway)
2. Set `DATABASE_URL` environment variable
3. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Option 2: MySQL

1. Create a MySQL database
2. Set `DATABASE_URL` environment variable
3. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Option 3: SQLite (Development/Preview Only)

**Note:** SQLite is NOT recommended for production on Vercel because:
- Vercel filesystem is read-only in production
- Database won't persist between deployments

For preview environments:
```bash
DATABASE_URL="file:./data/preview.db"
```

## Deployment Checklist

- [ ] Set all required environment variables
- [ ] Configure database (PostgreSQL/MySQL recommended)
- [ ] Run Prisma migrations
- [ ] Update `NEXT_PUBLIC_APP_URL` to your domain
- [ ] Generate new `SESSION_SECRET` for production
- [ ] Configure custom domain (if needed)
- [ ] Test deployment in preview environment
- [ ] Promote to production

## Common Issues

### Build Error: "DATABASE_URL not found"

**Solution:** Add `DATABASE_URL` to Vercel environment variables.

### Build Error: "Prisma Client not generated"

**Solution:** Already handled by `postinstall` script. If error persists, check build logs.

### Runtime Error: "Can't reach database server"

**Solutions:**
1. Verify `DATABASE_URL` is correct
2. Check database server is accessible from Vercel
3. Verify database credentials
4. Check firewall/IP allowlist settings

## Support

For issues, check:
- Vercel Build Logs
- Prisma Documentation: https://pris.ly/d/vercel-build
- Next.js Documentation: https://nextjs.org/docs/deployment
