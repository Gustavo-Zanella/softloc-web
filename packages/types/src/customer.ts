export type CustomerType = 'PF' | 'PJ';

export interface CustomerAddress {
  id: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  principal: boolean;
}

export interface Customer {
  id: string;
  type: CustomerType;
  name: string;
  cpfCnpj: string;
  email?: string;
  phone: string;
  phone2?: string;
  active: boolean;
  addresses: CustomerAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  type: CustomerType;
  name: string;
  cpfCnpj: string;
  email?: string;
  phone: string;
  phone2?: string;
  addresses?: Omit<CustomerAddress, 'id'>[];
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}
