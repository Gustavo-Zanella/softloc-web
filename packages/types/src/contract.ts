import type { Customer } from './customer';
import type { Product } from './product';

export type ContractStatus =
  | 'ORCAMENTO'
  | 'CONFIRMADO'
  | 'EM_ANDAMENTO'
  | 'DEVOLVIDO'
  | 'FINALIZADO'
  | 'CANCELADO';

export type CondicaoItem = 'BOM' | 'DANIFICADO' | 'PERDIDO';

export interface RentalContractItem {
  id: string;
  rental_contract_id: string;
  product_id: string;
  product?: Product;
  quantidade: number;
  preco_unitario_aplicado: number;
  subtotal: number;
  condicao_saida: CondicaoItem;
  condicao_retorno?: CondicaoItem;
  avaria: boolean;
  descricao_avaria?: string;
  valor_multa_avaria?: number;
}

export interface RentalContract {
  id: string;
  customer_id: string;
  address_id: string;
  numero_contrato: string;
  status: ContractStatus;
  data_evento: string;
  data_retirada_prevista: string;
  data_devolucao_prevista: string;
  data_devolucao_real?: string;
  valor_subtotal: number;
  valor_desconto: number;
  valor_caucao_total: number;
  valor_total: number;
  observacoes?: string;
  customer?: Customer;
  items: RentalContractItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateContractDto {
  customer_id: string;
  address_id: string;
  data_evento: string;
  data_retirada_prevista: string;
  data_devolucao_prevista: string;
  valor_desconto?: number;
  observacoes?: string;
  items: {
    product_id: string;
    quantidade: number;
  }[];
}

export interface RegisterReturnDto {
  data_devolucao_real: string;
  items: {
    item_id: string;
    condicao_retorno: CondicaoItem;
    avaria?: boolean;
    descricao_avaria?: string;
    valor_multa_avaria?: number;
  }[];
}
