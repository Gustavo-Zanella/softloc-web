import Link from 'next/link';
import { Instagram, Facebook, Phone, MapPin } from 'lucide-react';
import type { SiteSettings } from '@softloc/types';

interface SiteFooterProps {
  settings: SiteSettings | null;
}

export function SiteFooter({ settings }: SiteFooterProps) {
  const name = settings?.nomefantasia ?? 'SoftLoc';

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-xl font-bold text-white mb-3">{name}</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Locação de itens para festas e eventos. Qualidade e elegância para tornar sua celebração inesquecível.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Início</Link></li>
              <li><Link href="/produtos" className="hover:text-white transition-colors">Catálogo</Link></li>
              <li><Link href="/contato" className="hover:text-white transition-colors">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Contato</h4>
            <ul className="space-y-2 text-sm">
              {settings?.whatsappNumero && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-400" />
                  <a
                    href={`https://wa.me/${settings.whatsappNumero}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {settings.whatsappNumero}
                  </a>
                </li>
              )}
              {settings?.enderecoExibicao && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>{settings.enderecoExibicao}</span>
                </li>
              )}
              <li className="flex items-center gap-3 mt-3">
                {settings?.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="hover:text-white transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {settings?.facebookUrl && (
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"
                    className="hover:text-white transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {name}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
