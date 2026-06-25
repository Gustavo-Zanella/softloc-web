import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import type { SiteSettings } from '@softloc/types';
import { cn } from '@softloc/ui';

interface SiteHeaderProps {
  settings: SiteSettings | null;
}

export function SiteHeader({ settings }: SiteHeaderProps) {
  const name = settings?.nomefantasia ?? 'SoftLoc';
  const logo = settings?.logoUrl;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          {logo ? (
            <Image src={logo} alt={name} width={120} height={40} className="h-10 w-auto" />
          ) : (
            <span className="font-display text-xl font-bold text-primary">{name}</span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition-colors">
            Início
          </Link>
          <Link href="/produtos" className="hover:text-primary transition-colors">
            Catálogo
          </Link>
          <Link href="/contato" className="hover:text-primary transition-colors">
            Contato
          </Link>
        </nav>

        {settings?.whatsappNumero && (
          <a
            href={`https://wa.me/${settings.whatsappNumero}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'hidden md:inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors',
              'bg-green-500 hover:bg-green-600'
            )}
          >
            WhatsApp
          </a>
        )}

        <button className="md:hidden p-2 rounded-md hover:bg-muted" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
