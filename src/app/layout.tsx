import './globals.css';
import React from 'react';

export const metadata = {
  title: 'AutoRental · Gestão de Veículos',
  description: 'Sistema de gestão de veículos com Azure Blob + Table Storage'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
