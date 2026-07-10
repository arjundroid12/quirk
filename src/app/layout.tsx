import { Providers } from "@/components/providers";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QUIRK — AI toolkit for content creators",
  description:
    "Find your quirk. Ship it. The AI-native workspace for creators who'd rather create than juggle 5 tools.",
  keywords: [
    "QUIRK",
    "AI creator tools",
    "script generator",
    "content ideas",
    "thumbnail tester",
    "UGC creator",
    "YouTube script",
    "Reels script",
  ],
  authors: [{ name: "Arjun Vashishtha" }],
  icons: {
    icon: "/quirk/favicon.svg",
  },
  openGraph: {
    title: "QUIRK — AI toolkit for content creators",
    description:
      "Find your quirk. Ship it. The AI-native workspace for creators who'd rather create than juggle 5 tools.",
    siteName: "QUIRK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QUIRK",
    description: "AI toolkit for content creators. Find your quirk. Ship it.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Cloudflare Web Analytics beacon — replace data-token with real CF Web Analytics token after deploy */}
        {process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN}"}`}
          />
        )}
      </head>
      <body
        className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
