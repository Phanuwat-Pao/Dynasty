import ConvexClientProvider from "@/app/[lang]/components/convex-client-provider";
import { enUS, thTH } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import { i18n, type Locale } from "../../i18n-config";
import "../globals.css";
import { ReactScan } from "./components/react-scan";
import { ThemeProvider } from "./components/theme-provider";
const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Dynasty",
  description: "Dynasty is a tool for visualizing and analyzing family trees",
  icons: {
    icon: "/convex.svg",
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    nocache: true,
    notranslate: true,
    indexifembedded: false,
    nositelinkssearchbox: true,
  },
  openGraph: {
    type: "website",
    title: "Dynasty",
    description:
      "Dynasty is a tool for visualizing and analyzing family trees.",
    images: "/convex.svg",
    siteName: "Dynasty",
    locale: "en_US",
    alternateLocale: ["th_TH"],
  },
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}>) {
  const { lang } = await params;
  return (
    <html lang={lang} suppressHydrationWarning>
      <ReactScan />
      <body
        className={`${sarabun.variable} antialiased h-full w-dvw flex flex-col`}
      >
        <ClerkProvider dynamic localization={lang == "th" ? thTH : enUS}>
          <ConvexClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkProvider>
        <div className="fixed bottom-0 right-0 text-sm text-gray-500">
          {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
