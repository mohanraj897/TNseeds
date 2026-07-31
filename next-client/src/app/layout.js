import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { UIProvider } from "@/context/UIContext";
import NavbarWrapper from "@/components/NavbarWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "AgriCart | Connecting Farmers & Dealers",
  description: "A premium marketplace for high-quality seeds and agricultural supplies.",
};

import SeedBackground from "@/components/SeedBackground";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <AuthProvider>
          <ToastProvider>
            <UIProvider>
              <SeedBackground />
              <NavbarWrapper />
              {children}
            </UIProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
