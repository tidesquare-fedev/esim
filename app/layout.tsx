import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "eSIM 예약 서비스",
  description: "eSIM 예약 서비스 프로토타입",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body className="font-sans bg-gray-50">
        <div className="container mx-auto max-w-4xl bg-white min-h-screen shadow-lg">
          {children}
        </div>
      </body>
    </html>
  );
}
