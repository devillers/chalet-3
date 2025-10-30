# Chalet Manager - Production-Ready Brochure Site

A fully-featured, production-ready brochure website for Chalet Manager built with Next.js 13, TypeScript, and Tailwind CSS. Features comprehensive SEO, accessibility, internationalization (FR/EN), and GDPR compliance.

## Features

### Core Functionality
- ✅ **Internationalization (i18n)**: French (default) and English
- ✅ **SEO Optimized**: Meta tags, Open Graph, Twitter Cards, JSON-LD schema
- ✅ **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation, semantic HTML
- ✅ **Performance**: SSG pages, optimized images, minimal JavaScript
- ✅ **Security**: HTTPS headers (CSP, HSTS, X-Frame-Options, etc.)
- ✅ **GDPR Compliant**: Privacy policy, consent checkbox, data protection

### Pages (FR/EN)
- Home (`/[locale]/`)
- Services (`/[locale]/services`)
- About (`/[locale]/about`)
- Contact with working form (`/[locale]/contact`)
- Legal Notice (`/[locale]/legal-notice`)
- Privacy Policy (`/[locale]/privacy-policy`)
- Custom 404 & 500 error pages

### Technical Stack
- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **Email**: Nodemailer (SMTP)
- **SEO**: next-sitemap, dynamic metadata
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
```env
NEXT_PUBLIC_SITE_URL=https://chalet-manager.fr
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build

Create a production build:
```bash
npm run build
```

This will:
1. Build the Next.js application
2. Generate sitemap.xml and robots.txt via next-sitemap

Start the production server:
```bash
npm run start
```

### Type Checking

Run TypeScript type checking:
```bash
npm run typecheck
```

### Linting

Run ESLint:
```bash
npm run lint
```

## Project Structure

```
├── app/
│   ├── [locale]/              # Locale-based routes
│   │   ├── page.tsx          # Home page
│   │   ├── services/         # Services page
│   │   ├── about/            # About page
│   │   ├── contact/          # Contact page
│   │   ├── legal-notice/     # Legal notice
│   │   ├── privacy-policy/   # Privacy policy
│   │   ├── layout.tsx        # Locale layout with Header/Footer
│   │   ├── not-found.tsx     # 404 page
│   │   └── error.tsx         # 500 error page
│   ├── api/
│   │   └── contact/route.ts  # Contact form API endpoint
│   └── globals.css           # Global styles
├── components/
│   ├── layout/               # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── sections/             # Section components
│   │   ├── HeroSection.tsx
│   │   ├── ServiceCard.tsx
│   │   └── CTAButton.tsx
│   ├── forms/
│   │   └── ContactForm.tsx   # Contact form with validation
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── i18n.ts              # i18n utilities
│   ├── email/
│   │   └── nodemailer.ts    # Email sending logic
│   ├── seo/
│   │   └── metadata.ts      # SEO metadata generation
│   └── validators/
│       └── contact.ts       # Form validation schemas
├── public/
│   └── locales/             # Translation files
│       ├── fr/common.json   # French translations
│       └── en/common.json   # English translations
├── middleware.ts            # Locale redirect middleware
├── next.config.js          # Next.js configuration
├── next-sitemap.config.js  # Sitemap configuration
└── tailwind.config.ts      # Tailwind configuration
```

## Internationalization (i18n)

The site supports French (default) and English. Translation files are located in `public/locales/[locale]/common.json`.

### Adding Translations

Edit the JSON files in `public/locales/` to add or modify translations.

### Switching Languages

Users can switch languages using the language switcher in the header, which maintains the current page context.

## SEO Features

### Metadata
- Dynamic page titles and descriptions
- Open Graph tags for social sharing
- Twitter Card tags
- Canonical URLs
- Hreflang alternates for FR/EN

### Sitemap & Robots
- Automatically generated sitemap.xml
- robots.txt configuration
- All localized pages included

### Schema Markup
- LocalBusiness JSON-LD schema on home page
- Rich snippets for better search visibility

## Accessibility

### WCAG 2.1 AA Compliance
- Semantic HTML (header, nav, main, footer, sections)
- Proper heading hierarchy (h1-h6)
- ARIA labels and attributes
- Keyboard navigation support
- Focus visible indicators
- Alt text on all images
- Form labels and error messages

### Testing
Test keyboard navigation:
- Tab through all interactive elements
- Enter/Space to activate buttons/links
- Escape to close modals

## Security

### HTTP Headers
Configured in `next.config.js`:
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy
- Permissions-Policy

### Contact Form
- Server-side validation
- Rate limiting (5 requests/hour per IP)
- No secrets exposed to client
- Input sanitization

## GDPR Compliance

### Data Collection
- Contact form only collects data with explicit consent
- Consent checkbox required before submission
- Links to privacy policy

### Privacy Policy
- Detailed data collection practices
- Purpose and retention period
- User rights (access, rectification, deletion)
- Contact information for data requests

### No Tracking by Default
- No analytics loaded without consent
- No cookies set without user permission
- Privacy-first approach

## Email Configuration

The contact form uses Nodemailer to send emails via SMTP. Configure your SMTP settings in `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Gmail Setup
1. Enable 2-factor authentication
2. Create an App Password
3. Use the app password in SMTP_PASS

### Other Providers
Works with any SMTP provider (SendGrid, Mailgun, AWS SES, etc.)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket

2. Import project in Vercel dashboard

3. Add environment variables:
   - `NEXT_PUBLIC_SITE_URL`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`

4. Deploy

Vercel will automatically:
- Build the project
- Generate sitemap
- Enable CDN caching
- Set up preview deployments

### Other Platforms

The site can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted with Node.js

## Performance

### Core Web Vitals
Optimized for:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Optimizations
- Static Site Generation (SSG) for all pages
- Next.js Image optimization
- Minimal JavaScript bundle
- CSS purging via Tailwind
- Efficient font loading

## Customization

### Design Tokens

Edit `tailwind.config.ts` to customize:
- Colors
- Spacing
- Typography
- Border radius
- Shadows

### Content

Update translations in `public/locales/[locale]/common.json` to modify:
- Page titles and descriptions
- Navigation labels
- Service descriptions
- Contact information

## Testing

### Manual Testing Checklist
- [ ] All pages load in FR and EN
- [ ] Navigation works correctly
- [ ] Language switcher maintains context
- [ ] Contact form submits successfully
- [ ] Form validation works
- [ ] 404 page displays for invalid routes
- [ ] Error page displays on errors
- [ ] Mobile responsive on all pages
- [ ] Keyboard navigation works
- [ ] Links have focus indicators

### Lighthouse Audit
Run Lighthouse in Chrome DevTools to verify:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

## Support

For issues or questions:
- Email: contact@chalet-manager.fr
- Create an issue in the repository

## License

© 2024 Chalet Manager. All rights reserved.
