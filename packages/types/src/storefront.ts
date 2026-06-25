import type { Category } from './category';
import type { Product, ProductAvailability } from './product';

export interface SiteSettings {
  nomefantasia: string;
  logoUrl?: string;
  corPrimaria: string;
  corSecundaria: string;
  bannerTitulo: string;
  bannerSubtitulo: string;
  bannerImagemUrl?: string;
  textoSobre: string;
  whatsappNumero: string;
  instagramUrl?: string;
  facebookUrl?: string;
  enderecoExibicao?: string;
  latitude?: number;
  longitude?: number;
}

export interface StorefrontCategory extends Category {}

export interface StorefrontProduct extends Product {}

export interface StorefrontProductDetail extends Product {
  relatedProducts?: Product[];
}

export type { ProductAvailability };

export interface ContactFormDto {
  name: string;
  phone: string;
  message: string;
}
