import { Inter } from "next/font/google";
import TopNav from "@/components/TopNav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Process Change Database",
  description: "Track and manage manufacturing process changes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TopNav />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
