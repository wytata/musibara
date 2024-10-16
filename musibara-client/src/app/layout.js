"use client";

import localFont from "next/font/local";
import Sidenav from "@/components/Sidenav";
import "./globals.css";
import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// export const metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

export default function RootLayout({ children }) {

  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };


  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="fullContainer">
          <div className={`leftContainer ${isCollapsed ? "collapsed" : ""}`}>
            <button className="hamburgerButton" onClick={toggleCollapse}>
              <GiHamburgerMenu />
            </button>
            <Sidenav />
          </div>
          <div className="rightContainer">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
