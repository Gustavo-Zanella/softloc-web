export type InvoiceStatus = 'PENDENTE' | 'AUTORIZADA' | 'ERRO' | 'CANCELADA';

export interface Invoice {
  id: string;
  contractId: string;
  number?: string;
  series?: string;
  status: InvoiceStatus;
  providerResponse?: string;
  errorMessage?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  issuedAt?: string;
  createdAt: string;
  updatedAt: string;
}
