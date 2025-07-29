import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/auth-context'
import { EditorProvider } from '@/contexts/editor-context'
import { Toaster } from 'sonner'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Numbly AI - Editor de Contratos Inteligente",
  description: "Crie contratos jurídicos profissionais com IA e edição colaborativa em tempo real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-gray-950 text-white`}>
        <AuthProvider>
          <EditorProvider>
            {children}
            <Toaster position="top-right" />
          </EditorProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
