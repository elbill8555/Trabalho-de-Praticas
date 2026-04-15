import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Fluid Architect — Gestão de Tarefas',
  description: 'Plataforma centralizada de gestão de tarefas e produtividade.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${inter.variable}`}>
      <head>
        {/* Material Symbols Outlined — required for icons across all pages */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body style={{ fontFamily: 'var(--font-inter), sans-serif', background: '#f8f9fa', color: '#191c1d' }}>
        {children}
      </body>
    </html>
  );
}
