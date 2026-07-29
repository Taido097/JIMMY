import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jimmy — Fashion Portfolio',
  description: 'Experimental fashion portfolio for Jimmy, featuring selected work, editorials, campaigns, and creative direction.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
