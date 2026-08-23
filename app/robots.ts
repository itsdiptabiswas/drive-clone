import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
	const baseUrl = 'https://mbox.diptabiswas.in'

	return {
		rules: {
			userAgent: '*',
			allow: ['/', '/login', '/plans', '/contact-us', '/privacy-policy', '/terms-and-conditions', '/refund-policy'],
			disallow: ['/api/', '/bin', '/settings', '/shared', '/profile', '/getting-started', '/reset-password', '/q'],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	}
}
