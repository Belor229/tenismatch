import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
// });

export const metadata: Metadata = {
  title: "TennisMatch | Trouvez votre partenaire de tennis",
  description: "Plateforme dédiée au tennis pour trouver des partenaires, organiser des matchs et participer à des événements locaux.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="font-sans antialiased min-h-screen flex flex-col pt-14 md:pt-16 pb-16 md:pb-0 bg-ui-gray/30">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

