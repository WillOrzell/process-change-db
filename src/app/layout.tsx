import { Inter } from "next/font/google";
import UserSelector from "@/components/UserSelector";
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
        <div className="sticky top-0 z-50 bg-gray-100 border-b border-gray-200">
          <div className="container mx-auto px-4 py-2">
            <UserSelector />
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
