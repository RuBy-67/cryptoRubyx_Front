import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProvider from "@/components/ClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CryptoRubyx",
  description: "Votre portfolio crypto personnalisé",
  icons: [
    {
      rel: "icon",
      url: "/logos/logoWithoutTxt.png",
      sizes: "32x32",
      type: "image/png",
    },
    {
      rel: "icon",
      url: "/logos/logoWithoutTxt.png",
      sizes: "16x16",
      type: "image/png",
    },
    {
      rel: "apple-touch-icon",
      url: "/logos/logoWithoutTxt.png",
      sizes: "180x180",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
