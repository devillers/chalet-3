# Deployment Guide - Chalet Manager

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] SMTP credentials tested
- [ ] Build passes locally (`npm run build`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] All pages tested in FR and EN
- [ ] Contact form tested and working
- [ ] Mobile responsive verified
- [ ] Accessibility tested

## Vercel Deployment (Recommended)

### Initial Setup

1. **Push to Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   In Vercel dashboard, add these environment variables:

   ```
   NEXT_PUBLIC_SITE_URL=https://chalet-manager.fr
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASS=your-password
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at a Vercel URL

### Custom Domain Setup

1. In Vercel dashboard, go to Project Settings → Domains
2. Add your custom domain: `chalet-manager.fr`
3. Add `www.chalet-manager.fr` (optional)
4. Update DNS records as instructed by Vercel
5. Wait for DNS propagation (can take up to 48 hours)

### Post-Deployment

1. **Verify Pages**
   - Test all pages in FR and EN
   - Verify contact form sends emails
   - Check mobile responsiveness

2. **SEO Verification**
   - Submit sitemap to Google Search Console: `https://chalet-manager.fr/sitemap.xml`
   - Submit to Bing Webmaster Tools
   - Verify Open Graph tags with [OpenGraph.xyz](https://www.opengraph.xyz/)

3. **Performance Testing**
   - Run Lighthouse audit
   - Check Core Web Vitals
   - Test page load speed

## Alternative Deployments

### Netlify

1. Connect Git repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy

### Self-Hosted (Node.js)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Install dependencies on server**
   ```bash
   npm ci --production
   ```

3. **Set environment variables**
   ```bash
   export NEXT_PUBLIC_SITE_URL=https://chalet-manager.fr
   export SMTP_HOST=smtp.example.com
   export SMTP_PORT=587
   export SMTP_USER=your-email@example.com
   export SMTP_PASS=your-password
   ```

4. **Start the server**
   ```bash
   npm run start
   ```

5. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start npm --name "chalet-manager" -- start
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx as reverse proxy**
   ```nginx
   server {
       listen 80;
      server_name chalet-manager.fr;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Set up SSL with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d chalet-manager.fr -d www.chalet-manager.fr
   ```

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Production URL | Yes | `https://chalet-manager.fr` |
| `SMTP_HOST` | SMTP server hostname | Yes | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | Yes | `587` |
| `SMTP_USER` | SMTP username/email | Yes | `contact@chalet-manager.fr` |
| `SMTP_PASS` | SMTP password | Yes | `your-password` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | No | `false` |

## SMTP Provider Configuration

### Gmail
1. Enable 2-factor authentication
2. Generate App Password
3. Use:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: Your Gmail address
   - Pass: App password (not regular password)

### SendGrid
- Host: `smtp.sendgrid.net`
- Port: `587`
- User: `apikey`
- Pass: Your SendGrid API key

### Mailgun
- Host: `smtp.mailgun.org`
- Port: `587`
- User: Your Mailgun SMTP username
- Pass: Your Mailgun SMTP password

### AWS SES
- Host: `email-smtp.us-east-1.amazonaws.com` (adjust region)
- Port: `587`
- User: Your SES SMTP username
- Pass: Your SES SMTP password

## Post-Deployment Verification

### SEO Checklist
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Verify robots.txt is accessible
- [ ] Test Open Graph tags
- [ ] Verify hreflang tags for FR/EN
- [ ] Check canonical URLs
- [ ] Test structured data with [Schema Validator](https://validator.schema.org/)

### Performance Checklist
- [ ] Lighthouse score > 90 on all metrics
- [ ] Images loading properly
- [ ] No JavaScript errors in console
- [ ] All pages load in < 3 seconds
- [ ] Mobile experience is smooth

### Security Checklist
- [ ] HTTPS enabled
- [ ] Security headers present (check with [securityheaders.com](https://securityheaders.com))
- [ ] No secrets in client-side code
- [ ] Contact form rate limiting working
- [ ] CORS configured properly

### Accessibility Checklist
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] All images have alt text

## Monitoring

### Setup Monitoring (Optional)

1. **Vercel Analytics**
   - Automatically enabled in Vercel
   - View in Vercel dashboard

2. **Google Analytics** (with GDPR consent)
   - Add tracking ID to environment
   - Only load after user consent

3. **Sentry for Error Tracking**
   ```bash
   npm install @sentry/nextjs
   ```
   - Configure in `sentry.client.config.js`
   - Set `SENTRY_DSN` environment variable

## Rollback Procedure

### Vercel
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Self-Hosted
```bash
git revert HEAD
npm run build
pm2 restart chalet-manager
```

## Support

For deployment issues:
- Check build logs in Vercel dashboard
- Verify environment variables are set
- Test SMTP connection locally first
- Check DNS propagation status

## Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Test locally
npm run build

# Deploy
git push
```

### Backup
- Repository is backed up in Git
- Environment variables backed up securely
- No database to backup (stateless site)
