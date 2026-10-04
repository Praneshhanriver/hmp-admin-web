import type { Metadata } from "next";
import "./globals.scss";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

export const metadata: Metadata = {
  title: "HMP Administration",
};

// Root layout: wraps every page in the app, rendered once
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}