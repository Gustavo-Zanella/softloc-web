import type { Customer } from './customer';
import type { Product } from './product';

export type ContractStatus =
  | 'ORCAMENTO'
  | 'CONFIRMADO'
  | 'EM_ANDAMENTO'
  | 'DEVOLVIDO'
  | 'FINALIZADO'
  | 'CANCELADO';

export type ItemCondition = 'OK' | 'AVARIADO' | 'PERDIDO';

export interface ContractItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  returnCondition?: ItemCondition;
  damageFee?: number;
  returnNotes?: string;
}

export interface RentalContract {
  id: string;
  contractNumber: string;
  status: ContractStatus;
  customerId: string;
  customer?: Customer;
  startDate: string;
  endDate: string;
  deliveryAddressId?: string;
  items: ContractItem[];
  subtotal: number;
  discount?: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractDto {
  customerId: string;
  startDate: string;
  endDate: string;
  deliveryAddressId?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  discount?: number;
  notes?: string;
}

export interface RegisterReturnDto {
  items: {
    contractItemId: string;
    condition: ItemCondition;
    damageFee?: number;
    notes?: string;
  }[];
}
