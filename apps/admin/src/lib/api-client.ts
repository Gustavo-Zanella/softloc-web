import type {
  User, CreateUserDto, UpdateUserDto,
  Customer, CreateCustomerDto, UpdateCustomerDto,
  Category, CreateCategoryDto, UpdateCategoryDto,
  Product, CreateProductDto, UpdateProductDto,
  RentalContract, CreateContractDto, RegisterReturnDto,
  Invoice,
  DashboardMetrics,
  PaginatedResponse,
} from '@softloc/types';

const BASE_URL =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? 'http://localhost:3000/api/v1')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1');

export class ApiClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        ...init.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(Array.isArray(err.message) ? err.message.join(', ') : err.message);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  // Dashboard
  dashboard = {
    getMetrics: () => this.request<DashboardMetrics>('/dashboard'),
  };

  // Customers
  customers = {
    list: (params?: { page?: number; limit?: number; search?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.search) qs.set('search', params.search);
      return this.request<PaginatedResponse<Customer>>(`/customers?${qs}`);
    },
    get: (id: string) => this.request<Customer>(`/customers/${id}`),
    create: (dto: CreateCustomerDto) =>
      this.request<Customer>('/customers', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id: string, dto: UpdateCustomerDto) =>
      this.request<Customer>(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
    remove: (id: string) => this.request<void>(`/customers/${id}`, { method: 'DELETE' }),
  };

  // Categories
  categories = {
    list: () => this.request<Category[]>('/categories'),
    get: (id: string) => this.request<Category>(`/categories/${id}`),
    create: (dto: CreateCategoryDto) =>
      this.request<Category>('/categories', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id: string, dto: UpdateCategoryDto) =>
      this.request<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
    remove: (id: string) => this.request<void>(`/categories/${id}`, { method: 'DELETE' }),
  };

  // Products
  products = {
    list: (params?: { page?: number; limit?: number; categoryId?: string; active?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.categoryId) qs.set('categoryId', params.categoryId);
      if (params?.active !== undefined) qs.set('active', String(params.active));
      return this.request<PaginatedResponse<Product>>(`/products?${qs}`);
    },
    get: (id: string) => this.request<Product>(`/products/${id}`),
    create: (dto: CreateProductDto) =>
      this.request<Product>('/products', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id: string, dto: UpdateProductDto) =>
      this.request<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
    remove: (id: string) => this.request<void>(`/products/${id}`, { method: 'DELETE' }),
    uploadImage: (id: string, file: File, isPrimary?: boolean) => {
      const form = new FormData();
      form.append('file', file);
      if (isPrimary) form.append('isPrimary', 'true');
      return fetch(`${BASE_URL}/products/${id}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.token}` },
        body: form,
      }).then((r) => r.json());
    },
    deleteImage: (productId: string, imageId: string) =>
      this.request<void>(`/products/${productId}/images/${imageId}`, { method: 'DELETE' }),
  };

  // Contracts
  contracts = {
    list: (params?: { page?: number; limit?: number; status?: string; customerId?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.status) qs.set('status', params.status);
      if (params?.customerId) qs.set('customerId', params.customerId);
      return this.request<PaginatedResponse<RentalContract>>(`/rental-contracts?${qs}`);
    },
    get: (id: string) => this.request<RentalContract>(`/rental-contracts/${id}`),
    create: (dto: CreateContractDto) =>
      this.request<RentalContract>('/rental-contracts', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id: string, dto: Partial<CreateContractDto>) =>
      this.request<RentalContract>(`/rental-contracts/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
    updateStatus: (id: string, status: string) =>
      this.request<RentalContract>(`/rental-contracts/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    registerDevolution: (id: string, dto: RegisterReturnDto) =>
      this.request<RentalContract>(`/rental-contracts/${id}/devolution`, { method: 'POST', body: JSON.stringify(dto) }),
    getPdf: (id: string) =>
      fetch(`${BASE_URL}/rental-contracts/${id}/pdf`, {
        headers: { Authorization: `Bearer ${this.token}` },
      }),
  };

  // Invoices
  invoices = {
    list: (params?: { contractId?: string }) => {
      const qs = new URLSearchParams();
      if (params?.contractId) qs.set('contractId', params.contractId);
      return this.request<Invoice[]>(`/invoices?${qs}`);
    },
    get: (id: string) => this.request<Invoice>(`/invoices/${id}`),
    emit: (contractId: string) =>
      this.request<Invoice>(`/invoices/emit/${contractId}`, { method: 'POST' }),
    consultarStatus: (id: string) =>
      this.request<Invoice>(`/invoices/${id}/status`),
    cancel: (id: string, justificativa: string) =>
      this.request<Invoice>(`/invoices/${id}/cancel`, { method: 'POST', body: JSON.stringify({ justificativa }) }),
  };

  // Users
  users = {
    list: () => this.request<User[]>('/users'),
    get: (id: string) => this.request<User>(`/users/${id}`),
    create: (dto: CreateUserDto) =>
      this.request<User>('/users', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id: string, dto: UpdateUserDto) =>
      this.request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
    remove: (id: string) => this.request<void>(`/users/${id}`, { method: 'DELETE' }),
  };
}

export function createApiClient(token: string) {
  return new ApiClient(token);
}
