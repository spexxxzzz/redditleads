import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs"; // Import ClerkProvider
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- MODIFIED METADATA OBJECT ---
export const metadata: Metadata = {
  title: "RedditLeads - AI-Powered Reddit Lead Generation",
  description: "Revolutionize your lead generation with RedditLeads's AI-driven platform, leveraging Reddit's vast community to find warm prospects and automate outreach.",
  openGraph: {
    title: "RedditLeads - AI-Powered Reddit Lead Generation",
    description: "Find warm prospects and automate outreach with AI.",
    url: "https://www.redditleads.net",
    siteName: "RedditLeads",
    images: [
      {
        url: "https://www.redditleads.net/Landing.png",
        width: 1200,
        height: 630,
        alt: "RedditLeads Application Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RedditLeads - AI-Powered Reddit Lead Generation",
    description: "Find warm prospects and automate outreach with AI.",
    images: ["https://www.redditleads.net/Landing.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_aW1tb3J0YWwtcHVwLTU4LmNsZXJrLmFjY291bnRzLmRldiQ"}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}