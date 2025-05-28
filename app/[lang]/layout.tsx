import ConvexClientProvider from "@/app/[lang]/components/convex-client-provider";
import { enUS, thTH } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
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
  description: "Dynasty",
  icons: {
    icon: "/convex.svg",
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
        className={`${sarabun.variable} antialiased h-dvh w-dvw flex flex-col`}
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
      </body>
    </html>
  );
}
