import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AlumniBridge — Turning alumni goodwill into structured, sustained mentorship",
    template: "%s · AlumniBridge",
  },
  description:
    "AlumniBridge connects students with experienced alumni, turns mentorship into measurable goals, and helps institutions understand career outcomes.",
  applicationName: "AlumniBridge",
  openGraph: {
    title: "AlumniBridge | Structured alumni mentorship",
    description:
      "A career-development and mentorship operating system for educational institutions.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
