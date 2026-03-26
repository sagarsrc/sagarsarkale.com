import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SkipToContent } from '@/components/SkipToContent';

export const metadata: Metadata = {
  title: {
    default: 'Sagar Sarkale — AI/NLP Engineer & Founder',
    template: '%s | Sagar Sarkale',
  },
  description: 'AI/NLP engineer and founder building language models, retrieval systems, and developer tools. Creator of Misal (Marathi LLM) and QuickCall.dev.',
  metadataBase: new URL('https://sagarsarkale.com'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sagarsarkale.com',
    siteName: 'Sagar Sarkale',
    title: 'Sagar Sarkale — AI/NLP Engineer & Founder',
    description: 'Building language models, retrieval systems, and AI products. Creator of Misal (Marathi LLM) and QuickCall.dev.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sagar Sarkale — AI/NLP Engineer & Founder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sagar Sarkale — AI/NLP Engineer & Founder',
    description: 'Building language models, retrieval systems, and AI products.',
    images: ['/og-image.png'],
    creator: '@sagar_sarkale',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-us" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" integrity="sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');var cls=(t==='dark'||t==='light')?t:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.add(cls);}catch(e){}})();` }} />
        <script dangerouslySetInnerHTML={{ __html: `console.log('%c\\u{1f44b} Hey there, curious one!','font-size:16px;font-weight:bold;');console.log('%cIf you\\'re reading this, we should talk \\u2192 sagar@smallstep.ai','font-size:12px;color:#22d3ee;');` }} />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-J90LP2EWLN" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-J90LP2EWLN');` }} />
      </head>
      <body>
        <ThemeProvider>
          <SkipToContent />
          <Header />
          <main id="main-content" className="main-content">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
