import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Afterhours — your matches, handled",
  description: "See every conversation, tune every persona, in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#FF5C79",
          colorBackground: "#1C1A26",
          colorText: "#F2EFF7",
          colorInputBackground: "#12111A",
          colorInputText: "#F2EFF7",
          borderRadius: "12px",
        },
      }}
    >
      <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`}>
        <body className="bg-bg text-text-primary font-body antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
