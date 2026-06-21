import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.css";
import type { Metadata, Viewport } from "next";
import { getServerSession } from "next-auth";
import "nprogress/nprogress.css";
import { getUserInfo } from "./_actions/user";
import TopBarLoader from "./components/loader/topbarLoader";
import "./globals.scss";
import { authOptions } from "./lib/authConfig";
import { ProfileProvider } from "./profileProvider";
import AppClientProvider from "./provider";

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: dark)", color: "#6a29ff" },
		{ media: "(prefers-color-scheme: light)", color: "#6a29ff" }
	],
	colorScheme: "light",
}


export const metadata: Metadata = {
	title: "MBOX — Free File Storage by Dipta Biswas",
	description: "MBOX is a free cloud file storage app built by Dipta Biswas (itsdiptabiswas). Upload, manage, and share your files securely.",
	creator: "Dipta Biswas",
	publisher: "Dipta Biswas",
	keywords: [
		"Dipta Biswas",
		"diptabiswas",
		"itsdiptabiswas",
		"MBOX",
		"file storage",
		"cloud storage",
		"free file storage",
	],
	authors: [
		{ name: "Dipta Biswas", url: "https://github.com/itsdiptabiswas" },
	],
	metadataBase: new URL("https://mbox.diptabiswas.in"),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: "MBOX — Free File Storage by Dipta Biswas",
		description: "MBOX is a free cloud file storage app built by Dipta Biswas (itsdiptabiswas). Upload, manage, and share your files securely.",
		url: "https://mbox.diptabiswas.in",
		siteName: "MBOX",
		images: [
			{
				url: "/logo.png",
				width: 512,
				height: 512,
				alt: "MBOX Logo",
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary",
		title: "MBOX — Free File Storage by Dipta Biswas",
		description: "Free cloud file storage app built by Dipta Biswas (itsdiptabiswas).",
		images: ["/logo.png"],
	},
	icons: [
		{ rel: "icon", url: "/assets/favicon-32x32.png", sizes: "32x32" },
		{ rel: "icon", url: "/assets/favicon-16x16.png", sizes: "16x16" },
		{ rel: "apple-touch-icon", url: "/assets/apple-touch-icon.png", sizes: "180x180" },
	],
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions)
	const userId = session ? String(session.user?._id) : ""
	const user = await getUserInfo(userId)

	return (
		<html lang='en'>
			<body suppressHydrationWarning={true}>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@graph": [
								{
									"@type": "Person",
									"name": "Dipta Biswas",
									"alternateName": ["diptabiswas", "itsdiptabiswas"],
									"url": "https://mbox.diptabiswas.in",
									"sameAs": [
										"https://github.com/itsdiptabiswas",
										"https://www.linkedin.com/in/dipta-biswas/"
									]
								},
								{
									"@type": "WebSite",
									"name": "MBOX",
									"url": "https://mbox.diptabiswas.in",
									"author": {
										"@type": "Person",
										"name": "Dipta Biswas"
									}
								}
							]
						})
					}}
				/>
				<TopBarLoader />
				{/* <NextTopLoader color="#6a29ff" /> */}
				<AppClientProvider>
					<ProfileProvider userInfo={user}>
						{children}
					</ProfileProvider>
				</AppClientProvider>
			</body>
		</html>
	);
}
