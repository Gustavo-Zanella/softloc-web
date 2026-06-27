export type PapelUsuario = 'ADMIN' | 'ATENDENTE' | 'FINANCEIRO';

export interface User {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  nome: string;
  email: string;
  senha: string;
  papel?: PapelUsuario;
}

export interface UpdateUserDto {
  nome?: string;
  email?: string;
  senha?: string;
  papel?: PapelUsuario;
  ativo?: boolean;
}
