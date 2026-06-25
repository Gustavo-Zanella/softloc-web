import type { Metadata } from 'next';
import { storefrontApi } from '@/lib/api';
import { ContactForm } from '@/components/contact-form';
import { Phone, MapPin, Instagram, Facebook } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Entre em contato conosco para solicitar orçamentos e tirar dúvidas.',
};

export const revalidate = 300;

export default async function ContatoPage() {
  const settings = await storefrontApi.getSettings().catch(() => null);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Contato</h1>
      <p className="text-muted-foreground mb-10">
        Fale conosco para solicitar orçamentos e esclarecer dúvidas.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <ContactForm />
        </div>

        <div className="space-y-8">
          {settings?.whatsappNumero && (
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">WhatsApp</h3>
                <a
                  href={`https://wa.me/${settings.whatsappNumero}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  {settings.whatsappNumero}
                </a>
              </div>
            </div>
          )}

          {settings?.enderecoExibicao && (
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Endereço</h3>
                <p className="text-muted-foreground">{settings.enderecoExibicao}</p>
              </div>
            </div>
          )}

          {(settings?.instagramUrl || settings?.facebookUrl) && (
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Instagram className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Redes Sociais</h3>
                <div className="flex gap-3">
                  {settings.instagramUrl && (
                    <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <Instagram className="h-4 w-4" /> Instagram
                    </a>
                  )}
                  {settings.facebookUrl && (
                    <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <Facebook className="h-4 w-4" /> Facebook
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {settings?.latitude && settings?.longitude && (
            <div className="rounded-xl overflow-hidden border h-64">
              <iframe
                src={`https://www.google.com/maps?q=${settings.latitude},${settings.longitude}&z=15&output=embed`}
                width="100%"
                height="100%"
                className="border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
