# Quick Start Guide - Chalet Manager

Get your Chalet Manager site running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- SMTP credentials ready (Gmail, SendGrid, etc.)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Gmail Users**:
1. Enable 2-factor authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `SMTP_PASS`

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000/fr (French) or http://localhost:3000/en (English)

### 4. Test Contact Form

1. Go to http://localhost:3000/fr/contact
2. Fill out the form
3. Check your email inbox (SMTP_USER)
4. You should receive the message

### 5. Build for Production

```bash
npm run build
```

This will:
- Build the Next.js app
- Generate sitemap.xml
- Generate robots.txt

### 6. Start Production Server

```bash
npm run start
```

## Available Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Check TypeScript types
```

## Project URLs

### French (Default)
- Homepage: http://localhost:3000/fr
- Services: http://localhost:3000/fr/services
- About: http://localhost:3000/fr/about
- Contact: http://localhost:3000/fr/contact
- Legal: http://localhost:3000/fr/legal-notice
- Privacy: http://localhost:3000/fr/privacy-policy

### English
- Homepage: http://localhost:3000/en
- Services: http://localhost:3000/en/services
- About: http://localhost:3000/en/about
- Contact: http://localhost:3000/en/contact
- Legal: http://localhost:3000/en/legal-notice
- Privacy: http://localhost:3000/en/privacy-policy

## Troubleshooting

### Contact Form Not Sending Emails

**Problem**: Form submits but no email received

**Solutions**:
1. Check SMTP credentials in `.env`
2. For Gmail, verify App Password is used (not regular password)
3. Check spam folder
4. Check console for errors: `npm run dev` and submit form
5. Test SMTP connection:
   ```bash
   node -e "require('./lib/email/nodemailer').verifyEmailConfig().then(console.log)"
   ```

### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
1. Delete `.next` folder: `rm -rf .next`
2. Delete `node_modules`: `rm -rf node_modules`
3. Reinstall: `npm install`
4. Try again: `npm run build`

### Port 3000 Already in Use

**Problem**: Can't start dev server

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### TypeScript Errors

**Problem**: Type errors in IDE

**Solution**:
```bash
npm run typecheck
```

Fix any reported errors.

## Customization Quick Tips

### Change Colors

Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: '#1d4ed8', // Change this
}
```

### Update Content

Edit translation files:
- French: `public/locales/fr/common.json`
- English: `public/locales/en/common.json`

### Add a New Page

1. Create file: `app/[locale]/new-page/page.tsx`
2. Add translations to `common.json`
3. Add link to Header navigation
4. Build and test

### Change Email Template

Edit `lib/email/nodemailer.ts`:
- Modify `htmlContent` for HTML version
- Modify `textContent` for plain text

## Deploy to Vercel

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. Import to Vercel: https://vercel.com/new

3. Add environment variables in Vercel dashboard

4. Deploy!

Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)

## Next Steps

1. ✅ Site running locally
2. ✅ Contact form tested
3. ✅ Build successful
4. 📝 Customize content in translation files
5. 🎨 Adjust colors in Tailwind config
6. 📸 Replace placeholder OG image
7. 🚀 Deploy to production
8. 📊 Submit sitemap to Google Search Console

## Support

- Full documentation: [README.md](README.md)
- Deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Project overview: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## Common Tasks

### Test in Both Languages
```bash
# French
open http://localhost:3000/fr

# English
open http://localhost:3000/en
```

### View Build Output
```bash
npm run build

# Check generated files
ls -la public/*.xml
ls -la public/*.txt
```

### Format Code
```bash
npx prettier --write .
```

### Check for Updates
```bash
npm outdated
```

---

**You're all set!** 🎉

Start customizing your Chalet Manager site and deploy when ready.
