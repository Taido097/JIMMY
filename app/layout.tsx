import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500'] });

export const metadata: Metadata = {
  title: 'Jimmy — Fashion Portfolio',
  description: 'Experimental fashion portfolio for Jimmy, featuring selected work, editorials, campaigns, and creative direction.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
