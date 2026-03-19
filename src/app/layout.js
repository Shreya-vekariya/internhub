// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "../redux/provider";
import NavbarWrapper from "../components/navbarWrapper"; // Import the new wrapper

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider>
          {/* Wrapper handles the logic */}
          <NavbarWrapper /> 
          <main>{children}</main>
        </ReduxProvider>
      </body>
    </html>
  );
}