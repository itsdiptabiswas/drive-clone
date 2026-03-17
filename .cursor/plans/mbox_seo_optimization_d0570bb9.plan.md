---
name: MBOX SEO Optimization
overview: Comprehensive SEO optimization for MBOX to rank on Google, Bing, and Facebook when users search "Dipta Biswas", using Next.js 14 App Router metadata APIs, structured data, sitemaps, and social meta tags.
todos:
  - id: env-setup
    content: Add SITE_URL environment variable to .env.example with placeholder
    status: pending
  - id: root-metadata
    content: Overhaul root metadata in app/layout.tsx with Open Graph, Twitter Cards, keywords, authors, robots, verification placeholders, metadataBase, and title template
    status: pending
  - id: og-image
    content: Create app/opengraph-image.tsx dynamic OG image with MBOX branding and 'Built by Dipta Biswas'
    status: pending
  - id: robots
    content: Create app/robots.ts with crawler rules (allow public pages, block /api, /bin, /settings, /profile)
    status: pending
  - id: sitemap
    content: Create app/sitemap.ts with all public page URLs
    status: pending
  - id: json-ld
    content: Create app/components/jsonLd.tsx with WebApplication and Person structured data schemas, add to root layout
    status: pending
  - id: page-metadata
    content: Add per-page metadata exports to all 7 public pages (getting-started, plans, contact-us, login, privacy-policy, terms-and-conditions, refund-policy)
    status: pending
  - id: manifest-update
    content: Update app/manifest.ts description to match the richer SEO description
    status: pending
  - id: next-config-headers
    content: Add X-Robots-Tag noindex header for /api routes in next.config.js
    status: pending
  - id: middleware-update
    content: Update middleware matcher to exclude sitemap.xml and robots.txt from auth checks
    status: pending
isProject: false
---

# MBOX SEO Optimization Plan

## Current State

The app has minimal SEO: a basic `title`, `description`, `creator`, `publisher`, and favicon icons in [app/layout.tsx](app/layout.tsx). There is **no** `robots.ts`, **no** `sitemap.ts`, **no** Open Graph / Twitter Card tags, **no** JSON-LD structured data, and **no** per-page metadata.

## What We Will Implement

### 1. Environment Variable for Site URL

Create a `SITE_URL` env var placeholder (default to `http://localhost:3000` for dev). Every SEO artifact will reference this so swapping in a real domain later is a one-line change.

- Add `SITE_URL` to `.env.example` (or `.env.local`) with a placeholder
- Reference it in all metadata, sitemap, robots, and JSON-LD files

### 2. Root Metadata Overhaul -- [app/layout.tsx](app/layout.tsx)

Expand the existing `metadata` export to include:

- `**metadataBase` -- set to `new URL(process.env.SITE_URL)` so all relative OG/icon URLs resolve correctly
- `**title.template` -- `"%s | MBOX - Built by Dipta Biswas"` so every page inherits branding
- `**title.default` -- `"MBOX - Secure Cloud File Storage | Built by Dipta Biswas"`
- `**description` -- rich keyword description mentioning SaaS, file storage, nested permissions, adaptive content rendering, and Dipta Biswas
- `**keywords` -- targeted array: `["Dipta Biswas", "MBOX", "cloud file storage", "file sharing", "SaaS", ...]`
- `**authors` -- `[{ name: "Dipta Biswas", url: "https://github.com/itsdiptabiswas" }]`
- `**creator` / `publisher` -- already present, keep as "Dipta Biswas"
- **Open Graph** -- `openGraph: { type: "website", siteName: "MBOX", title, description, url, locale: "en_US", images: [og-image] }`
- **Twitter Card** -- `twitter: { card: "summary_large_image", title, description, creator: "@itsdiptabiswas", images: [og-image] }`
- `**alternates.canonical` -- set to `SITE_URL`
- `**robots` -- `{ index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 } }`
- `**verification` (placeholder) -- Google Search Console and Bing Webmaster verification meta tags (values to be filled once registered)
- `**category` -- `"technology"`

### 3. OG Image -- `app/opengraph-image.tsx`

Create a dynamic OG image using Next.js `ImageResponse` (from `next/og`). This will be a branded 1200x630 image with:

- MBOX logo
- Tagline: "Secure Cloud File Storage"
- "Built by Dipta Biswas"
- Gradient background matching the brand purple `#6a29ff`

Next.js auto-discovers this file and injects the `og:image` meta tag for all pages that don't override it.

### 4. `robots.ts` -- [app/robots.ts](app/robots.ts) (new file)

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const siteUrl = process.env.SITE_URL || "http://localhost:3000";
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/api/",
					"/bin/",
					"/settings/",
					"/profile/",
					"/reset-password/",
				],
			},
		],
		sitemap: `${siteUrl}/sitemap.xml`,
	};
}
```

Key decisions:

- Allow crawling of public/marketing pages (`/getting-started`, `/plans`, `/contact-us`, `/privacy-policy`, etc.)
- Block private/authenticated routes (`/bin`, `/settings`, `/profile`, `/api`)
- Point to sitemap URL

### 5. `sitemap.ts` -- [app/sitemap.ts](app/sitemap.ts) (new file)

Dynamic sitemap including all public, crawlable pages:

```typescript
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	const siteUrl = process.env.SITE_URL || "http://localhost:3000";
	return [
		{
			url: `${siteUrl}/getting-started`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 1.0,
		},
		{
			url: `${siteUrl}/plans`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${siteUrl}/contact-us`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${siteUrl}/login`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${siteUrl}/privacy-policy`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: `${siteUrl}/terms-and-conditions`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: `${siteUrl}/refund-policy`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
	];
}
```

### 6. JSON-LD Structured Data -- [app/components/jsonLd.tsx](app/components/jsonLd.tsx) (new file)

Create a server component that injects JSON-LD into `<head>`. Include in root layout. Two schema objects:

**a) `WebApplication` schema** -- tells Google this is a SaaS app:

```json
{
	"@type": "WebApplication",
	"name": "MBOX",
	"description": "...",
	"applicationCategory": "Cloud Storage",
	"operatingSystem": "Web",
	"author": {
		"@type": "Person",
		"name": "Dipta Biswas",
		"url": "https://github.com/itsdiptabiswas"
	}
}
```

**b) `Person` schema** -- critical for appearing when someone searches "Dipta Biswas":

```json
{
	"@type": "Person",
	"name": "Dipta Biswas",
	"url": "https://github.com/itsdiptabiswas",
	"sameAs": ["https://github.com/itsdiptabiswas"],
	"jobTitle": "Software Developer",
	"knowsAbout": ["Next.js", "React", "Cloud Storage", "SaaS"]
}
```

### 7. Per-Page Metadata for Public Pages

Add `metadata` exports to each public page so they get unique titles, descriptions, and canonical URLs instead of inheriting the generic root metadata:

| Page            | File                                         | Title                   |
| --------------- | -------------------------------------------- | ----------------------- |
| Getting Started | `app/(routes)/getting-started/page.tsx`      | "Get Started with MBOX" |
| Plans           | `app/(routes)/plans/page.tsx`                | "Pricing Plans"         |
| Contact Us      | `app/(routes)/contact-us/page.tsx`           | "Contact Us"            |
| Login           | `app/(routes)/login/page.tsx`                | "Sign In"               |
| Privacy Policy  | `app/(routes)/privacy-policy/page.tsx`       | "Privacy Policy"        |
| Terms           | `app/(routes)/terms-and-conditions/page.tsx` | "Terms and Conditions"  |
| Refund Policy   | `app/(routes)/refund-policy/page.tsx`        | "Refund Policy"         |

Each will export:

```typescript
export const metadata: Metadata = {
	title: "Page Title",
	description: "Page-specific description mentioning MBOX and Dipta Biswas",
	alternates: { canonical: "/page-path" },
};
```

The `title.template` from root layout will automatically append `" | MBOX - Built by Dipta Biswas"`.

### 8. Manifest Update -- [app/manifest.ts](app/manifest.ts)

Update `description` to the richer keyword-laden description matching the root metadata.

### 9. Security Headers for SEO -- [next.config.js](next.config.js)

Add `X-Robots-Tag` header to API routes to explicitly tell crawlers not to index them:

```javascript
{
  source: '/api/:path*',
  headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
}
```

### 10. Middleware Update -- [middleware.ts](middleware.ts)

Ensure the sitemap and robots routes are not blocked by auth middleware. Add `sitemap.xml` and `robots.txt` to the matcher exclusion pattern so they are always publicly accessible.

---

## Post-Deployment TODOs (Manual Steps)

These are steps you'll do **after** buying a domain and deploying:

1. **Buy and configure domain** -- set `SITE_URL` env var to the production URL
2. **Google Search Console** -- submit sitemap, add verification meta tag
3. **Bing Webmaster Tools** -- submit sitemap, add verification meta tag
4. **Facebook Sharing Debugger** -- validate OG tags render correctly
5. **Google Rich Results Test** -- validate JSON-LD structured data
6. **Consider a personal portfolio page** linking to MBOX to strengthen "Dipta Biswas" search association
