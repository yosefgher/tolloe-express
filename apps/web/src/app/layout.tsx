import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { default: 'TOLLOE EXPRESS — Ethiopia Courier', template: '%s | TOLLOE EXPRESS' },
  description: "Ethiopia's most reliable courier service. Fast, secure, nationwide delivery.",
  keywords: ['courier', 'delivery', 'Ethiopia', 'Addis Ababa', 'shipping', 'TOLLOE EXPRESS'],
  openGraph: {
    siteName: 'TOLLOE EXPRESS',
    type: 'website',
    locale: 'en_ET',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
