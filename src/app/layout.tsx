import type { Metadata } from "next";
import type { ReactNode } from "react";
import QueryProvider from "@/components/providers/QueryProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import "./globals.scss";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

// Each page sets its own title: "Issue invitation · HMP Administration"
export const metadata: Metadata = {
  title: { default: "HMP Administration", template: "%s · HMP Administration" },
};

// Root layout: wraps every page in the app, rendered once.
// Stays a Server Component; the two providers are the small client parts
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
