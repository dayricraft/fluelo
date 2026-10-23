import type { Metadata } from "next";
import { Caveat, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Fluelo | Room Talk & English Learning",
  description:
    "Practice daily AI voice conversations with Sarah, Emma, Sophia, David, and Kenji in Room Talk. Fluent English with live feedback.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={[plusJakarta.variable, caveat.variable, "h-full antialiased"].join(" ")}
    >
      <body suppressHydrationWarning className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
