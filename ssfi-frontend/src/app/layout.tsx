import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
    title: 'SSFI - Skating Sports Federation of India',
    description: 'Official website of the Skating Sports Federation of India. Join us to become a champion in skating sports.',
    keywords: ['skating', 'sports', 'federation', 'india', 'speed skating', 'roller skating'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} ${outfit.variable} font-sans bg-dark-950 text-white antialiased`}>
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    )
}
