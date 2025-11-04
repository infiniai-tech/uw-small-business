# Deployment Guide for Vercel

This guide will help you deploy your UW Small Business Loan Analyzer to Vercel.

## Prerequisites

1. **GitHub Account**: Your code needs to be in a Git repository (GitHub, GitLab, or Bitbucket)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free)

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

If you haven't already, initialize Git and push to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in with your GitHub account

2. **Click "Add New Project"**

3. **Import Your Repository**
   - Select your `uw-small-business` repository from the list
   - Click "Import"

4. **Configure Project** (Vercel should auto-detect these):
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. **Click "Deploy"**
   - Vercel will build and deploy your app
   - This usually takes 1-2 minutes

6. **Your App is Live!**
   - You'll get a URL like: `https://uw-small-business.vercel.app`
   - You can customize the domain in project settings

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request gets its own preview URL

## Environment Variables

If you need to add environment variables later:
1. Go to Project Settings → Environment Variables
2. Add your variables
3. Redeploy

## Custom Domain

To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure `package.json` has correct build script
- Verify all dependencies are in `package.json` (not just installed locally)

### Routes Not Working
- The `vercel.json` file includes rewrites for client-side routing
- This should handle all routes correctly

### Assets Not Loading
- Ensure paths in your code use relative paths
- Check that `base` in `vite.config.js` is correct (default is fine)

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

