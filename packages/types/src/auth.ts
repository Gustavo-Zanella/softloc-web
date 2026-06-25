export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export type UserRole = 'ADMIN' | 'ATENDENTE' | 'FINANCEIRO';
