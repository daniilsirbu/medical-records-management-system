# Medical Records Management System - Deployment Documentation

## Overview
This document contains all important information about the deployment configuration for the Medical Records Management System.

## Deployments

### Development Environment
- **Convex Backend**: `dev:tangible-anteater-301`
- **URL**: https://tangible-anteater-301.convex.cloud
- **Frontend**: Runs locally on `http://localhost:5173` (or next available port)

### Production Environment
- **Convex Backend**: `prod:gregarious-dalmatian-304`
- **URL**: https://gregarious-dalmatian-304.convex.cloud
- **Frontend**: https://medical-records-management-system-np9ccxwv6.vercel.app

## Environment Configuration

### Development (.env.local)
```
CONVEX_DEPLOY_KEY=project:michel-mezzaninespecialiste-ca:my-project-chef-d77e1|eyJ2MiI6ImY0Y2UxOTU0YjA0NjQ1NGZiMDNkMmU3ODk0Mzg2ZTU0In0=
CONVEX_DEPLOYMENT=dev:tangible-anteater-301
VITE_CONVEX_URL=https://tangible-anteater-301.convex.cloud
SETUP_SCRIPT_RAN=1
```

### Production (.env.prod)
```
CONVEX_DEPLOYMENT=prod:gregarious-dalmatian-304
VITE_CONVEX_URL=https://gregarious-dalmatian-304.convex.cloud
```

### Vercel Environment Variables
- `VITE_CONVEX_URL`: https://gregarious-dalmatian-304.convex.cloud

### Convex Environment Variables

#### Development
- `SITE_URL`: http://localhost:5173
- `JWT_PRIVATE_KEY`: [RSA Private Key for JWT signing]
- `JWKS`: [JSON Web Key Set for JWT verification]
- `CONVEX_OPENAI_API_KEY`: [OpenAI proxy key]
- `CONVEX_OPENAI_BASE_URL`: https://academic-mammoth-217.convex.site/openai-proxy
- `CONVEX_RESEND_API_KEY`: [Resend proxy key]
- `RESEND_BASE_URL`: https://academic-mammoth-217.convex.site/resend-proxy

#### Production
- `SITE_URL`: https://medical-records-management-system-np9ccxwv6.vercel.app
- `JWKS`: [JSON Web Key Set for JWT verification]

## Deployment Commands

### Development
```bash
# Start development environment
npm run dev

# Individual commands
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only
npx convex dev          # Deploy to development backend
```

### Production
```bash
# Complete production deployment (backend + frontend)
npm run deploy:prod

# Individual commands
npx convex deploy --yes           # Deploy backend to production
npm run build                     # Build frontend locally
npx vercel --prod                # Deploy frontend to Vercel
```

### Build Commands
```bash
npm run build          # Build frontend for production
npm run lint           # Run linting and type checking
```

## Data Management

### Export Data
```bash
# Export from development
npx convex export --path backup.zip --include-file-storage

# Export from production
npx convex export --path backup.zip --include-file-storage --prod
```

### Import Data
```bash
# Import to development
npx convex import backup.zip --replace -y

# Import to production
npx convex import backup.zip --replace -y --prod
```

### Data Transfer Summary (Dev → Prod)
- **37,274 total documents imported**
- **2,235 patients** with complete records
- **34,731 patient notes** 
- **16 user accounts**
- **8 stored files** (documents/images)
- **Authentication data** (sessions, tokens, accounts)
- **Form templates and configurations**

## Authentication Configuration

### JWT Setup
The system uses JSON Web Tokens (JWT) for authentication with:
- RSA key pairs for signing/verification
- Separate keys for dev and production environments
- JWKS (JSON Web Key Set) for public key distribution

### Auth Flow
1. Users authenticate through Convex Auth
2. JWT tokens issued for session management
3. Tokens validated against JWKS on each request
4. Site URL validation ensures tokens only work for correct domains

## File Structure

### Key Configuration Files
- `package.json` - Scripts and dependencies
- `vercel.json` - Vercel deployment configuration
- `.env.local` - Development environment variables
- `.env.prod` - Production environment variables
- `setup.mjs` - Authentication setup script
- `convex/` - Backend functions and schema
- `src/` - Frontend React application

### Vercel Configuration (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "env": {
    "VITE_CONVEX_URL": "https://gregarious-dalmatian-304.convex.cloud"
  }
}
```

## Security Notes

### Environment Variables
- Never commit `.env.local` or `.env.prod` to version control
- Production environment variables are encrypted in Vercel
- Convex environment variables are managed through Convex dashboard/CLI

### Authentication Keys
- JWT private keys are unique per environment
- JWKS public keys are shared for token verification
- Site URL validation prevents cross-domain token usage

## Troubleshooting

### Common Issues

#### Setup Script Runs Every Time
- **Cause**: Missing `SETUP_SCRIPT_RAN=1` flag
- **Solution**: Add flag to `.env.local` or run setup with `--once` flag

#### Auth Errors in Production
- **Cause**: Missing or incorrect `SITE_URL` configuration
- **Solution**: Ensure `SITE_URL` matches Vercel deployment URL

#### Blank Production Website
- **Cause**: Missing `VITE_CONVEX_URL` environment variable
- **Solution**: Set environment variable in Vercel dashboard

#### Data Import Failures
- **Cause**: Table conflicts or missing permissions
- **Solution**: Use `--replace` flag or clear existing tables

### Useful Commands
```bash
# Check environment variables
npx convex env list --prod
npx vercel env ls

# View deployment logs
npx vercel logs
convex logs --prod

# Check deployment status
npx vercel inspect [deployment-url]
```

## Monitoring and Maintenance

### Regular Tasks
1. Monitor deployment health in Vercel dashboard
2. Check Convex function logs for errors
3. Backup data regularly using export commands
4. Update dependencies and security patches
5. Monitor authentication token usage

### Dashboard Links
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Convex Dashboard**: https://dashboard.convex.dev/
- **Production Convex**: https://dashboard.convex.dev/d/gregarious-dalmatian-304
- **Development Convex**: https://dashboard.convex.dev/d/tangible-anteater-301

## File Import Process

### Client Photos and Payment History Import

A custom import script (`import-files.mjs`) has been created to import client photos and payment history files into the database.

#### Folder Structure
- **client_photos/**: Contains folders named `CID_Firstname_Lastname` with patient photos
- **payment_history/**: Contains folders named `CID_Firstname_Lastname` with payment PDFs

#### Import Script Features
- Automatically matches folder names to patient records using CID
- Uploads photos to `photos` table via Convex storage
- Uploads payment files to `miscFiles` table with category "payment"
- Provides detailed progress logging
- Handles errors gracefully with detailed error messages

#### Running the Import
```bash
node import-files.mjs
```

#### Import Progress
- **Total Photo Folders**: 1,577+ client photo folders
- **Total Payment Folders**: 1,647+ payment history folders
- **Matching Logic**: Uses CID from folder name to find patient records
- **File Types Supported**: JPG, PNG (photos), PDF (payment history)

#### Database Schema Updates
- **photos** table: Stores client photos with metadata
- **miscFiles** table: Stores payment history and other documents
- Both tables link to patients via `patientId` field

## Contact and Support

For technical issues:
1. Check Vercel and Convex documentation
2. Review deployment logs for errors
3. Ensure environment variables are correctly configured
4. Verify authentication setup is complete

---

*Last Updated: October 7, 2025*
*Generated by Claude Code Assistant*