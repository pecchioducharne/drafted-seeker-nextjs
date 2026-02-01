# Quick Deployment Commands

## 🚀 Deploy to Netlify (After fixing secrets)

### Step 1: Add Environment Variables to Netlify

```bash
# Navigate to project
cd drafted-seeker-nextjs

# Link to Netlify site (if not already linked)
netlify link

# Import all environment variables from .env.local
netlify env:import .env.local
```

### Step 2: Commit and Push Changes

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Fix secrets exposure and configure Netlify deployment"

# Push to remote
git push origin main
```

### Step 3: Deploy

Netlify will automatically deploy when you push to your connected branch, or you can manually deploy:

```bash
# Deploy to production
netlify deploy --prod

# Or deploy to preview first
netlify deploy
```

## 🔍 Verify Environment Variables

```bash
# List all environment variables in Netlify
netlify env:list

# Get a specific variable value
netlify env:get OPENAI_API_KEY
```

## 🧪 Test Locally First

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (test if build succeeds)
npm run build
```

## 📊 Monitor Deployment

```bash
# Watch deployment logs
netlify watch

# Open Netlify dashboard
netlify open:site
```

## 🔧 Troubleshooting Commands

```bash
# Clear build cache and redeploy
netlify build --clear-cache

# View recent deployments
netlify deploy:list

# Check site status
netlify status

# View build logs for latest deployment
netlify logs:deploy
```

## 🔐 Manage Secrets

```bash
# Set individual environment variable
netlify env:set VARIABLE_NAME "value"

# Delete an environment variable
netlify env:unset VARIABLE_NAME

# Clone env vars from one site to another
netlify env:clone --from SITE_ID
```

## 📝 One-Line Deploy (After env vars are set)

```bash
git add . && git commit -m "Deploy updates" && git push && netlify deploy --prod
```

## ⚡ Quick Reference

| Command | Description |
|---------|-------------|
| `netlify link` | Link local project to Netlify site |
| `netlify env:import .env.local` | Import all env vars from file |
| `netlify env:list` | List all environment variables |
| `netlify deploy --prod` | Deploy to production |
| `netlify open:site` | Open site in browser |
| `netlify logs:deploy` | View deployment logs |

## 🎯 First Time Setup Checklist

- [ ] Link project: `netlify link`
- [ ] Import env vars: `netlify env:import .env.local`
- [ ] Verify env vars: `netlify env:list`
- [ ] Test build locally: `npm run build`
- [ ] Deploy: `netlify deploy --prod`
- [ ] Test live site
- [ ] Monitor for errors in Netlify dashboard

## 📚 Helpful Links

- Netlify Dashboard: https://app.netlify.com/sites/drafted-seeker
- Environment Variables: https://app.netlify.com/sites/drafted-seeker/configuration/env
- Deploy Logs: https://app.netlify.com/sites/drafted-seeker/deploys
