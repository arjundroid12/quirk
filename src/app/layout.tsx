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
  title: "CreateOS — AI toolkit for content creators",
  description:
    "Plan, script, optimize, and grow — all in one AI-native workspace. Built by creators, for creators.",
  keywords: [
    "CreateOS",
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
    icon: "/createos/favicon.svg",
  },
  openGraph: {
    title: "CreateOS — AI toolkit for content creators",
    description:
      "Plan, script, optimize, and grow — all in one AI-native workspace. Built by creators, for creators.",
    siteName: "CreateOS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CreateOS",
    description: "AI toolkit for content creators. Plan, script, optimize, grow.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
