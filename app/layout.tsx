import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@coinbase/onchainkit/styles.css';
import { Providers } from "@/lib/providers/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const isProduction = process.env.NODE_ENV === 'production';
  const appUrl = isProduction
    ? (process.env.NEXT_PUBLIC_APP_URL || 'https://vessel.finance')
    : 'http://localhost:3000';

  return {
    title: "Vessel Finance",
    description: "Platform pembiayaan ekspor terpercaya",
    manifest: "/manifest.json",
    other: {
      'fc:miniapp': JSON.stringify({
        version: 'next',
        imageUrl: `${appUrl}/vessel-icon.png`,
        button: {
          title: 'Launch Vessel Finance',
          action: {
            type: 'launch_miniapp',
            name: 'Vessel Finance',
            url: appUrl,
            splashImageUrl: `${appUrl}/splash.png`,
            splashBackgroundColor: '#000000',
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
