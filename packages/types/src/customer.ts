export type TipoPessoa = 'FISICA' | 'JURIDICA';
export type TipoEndereco = 'COBRANCA' | 'EVENTO' | 'OUTRO';

export interface CustomerAddress {
  id: string;
  tipo: TipoEndereco;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  ponto_referencia?: string;
}

export interface Customer {
  id: string;
  tipo_pessoa: TipoPessoa;
  nome: string;
  razao_social?: string;
  nome_fantasia?: string;
  cpf?: string;
  cnpj?: string;
  email: string;
  telefone: string;
  telefone_secundario?: string;
  data_nascimento?: string;
  observacoes?: string;
  ativo: boolean;
  addresses: CustomerAddress[];
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerDto {
  tipo_pessoa: TipoPessoa;
  nome: string;
  razao_social?: string;
  cpf?: string;
  cnpj?: string;
  email: string;
  telefone: string;
  telefone_secundario?: string;
  addresses?: Omit<CustomerAddress, 'id'>[];
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {
  ativo?: boolean;
}
