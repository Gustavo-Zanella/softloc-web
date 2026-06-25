import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { storefrontApi } from '@/lib/api';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await storefrontApi.getSettings();
    return {
      title: { default: settings.nomefantasia, template: `%s | ${settings.nomefantasia}` },
      description: settings.bannerSubtitulo,
      openGraph: {
        title: settings.nomefantasia,
        description: settings.bannerSubtitulo,
        images: settings.bannerImagemUrl ? [settings.bannerImagemUrl] : [],
      },
    };
  } catch {
    return {
      title: { default: 'SoftLoc', template: '%s | SoftLoc' },
      description: 'Locação de itens para festas e eventos',
    };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let settings = null;
  try {
    settings = await storefrontApi.getSettings();
  } catch {
    // usa defaults
  }

  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Providers>
          <SiteHeader settings={settings} />
          <main>{children}</main>
          <SiteFooter settings={settings} />
        </Providers>
      </body>
    </html>
  );
}
