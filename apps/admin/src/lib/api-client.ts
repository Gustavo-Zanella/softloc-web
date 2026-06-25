import type {
  User, CreateUserDto, UpdateUserDto,
  Customer, CreateCustomerDto, UpdateCustomerDto,
  Category, CreateCategoryDto, UpdateCategoryDto,
  Product, CreateProductDto, UpdateProductDto,
  RentalContract, CreateContractDto, RegisterReturnDto,
  Invoice,
  SiteSettings,
  DashboardMetrics,
  PaginatedResponse,
} from '@softloc/types';

const BASE_URL =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? 'http://localhost:3000')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000');

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
    list: (params?: { page?: number; limit?: number; status?: string; startDate?: string; endDate?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.status) qs.set('status', params.status);
      if (params?.startDate) qs.set('startDate', params.startDate);
      if (params?.endDate) qs.set('endDate', params.endDate);
      return this.request<PaginatedResponse<RentalContract>>(`/rental-contracts?${qs}`);
    },
    get: (id: string) => this.request<RentalContract>(`/rental-contracts/${id}`),
    create: (dto: CreateContractDto) =>
      this.request<RentalContract>('/rental-contracts', { method: 'POST', body: JSON.stringify(dto) }),
    confirm: (id: string) =>
      this.request<RentalContract>(`/rental-contracts/${id}/confirm`, { method: 'PATCH' }),
    start: (id: string) =>
      this.request<RentalContract>(`/rental-contracts/${id}/start`, { method: 'PATCH' }),
    registerReturn: (id: string, dto: RegisterReturnDto) =>
      this.request<RentalContract>(`/rental-contracts/${id}/return`, { method: 'PATCH', body: JSON.stringify(dto) }),
    cancel: (id: string) =>
      this.request<RentalContract>(`/rental-contracts/${id}/cancel`, { method: 'PATCH' }),
    getPdf: (id: string) =>
      fetch(`${BASE_URL}/rental-contracts/${id}/pdf`, {
        headers: { Authorization: `Bearer ${this.token}` },
      }),
  };

  // Invoices
  invoices = {
    list: (params?: { page?: number; limit?: number; status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.status) qs.set('status', params.status);
      return this.request<PaginatedResponse<Invoice>>(`/invoices?${qs}`);
    },
    get: (id: string) => this.request<Invoice>(`/invoices/${id}`),
    emit: (contractId: string) =>
      this.request<Invoice>('/invoices', { method: 'POST', body: JSON.stringify({ contractId }) }),
    reissue: (id: string) =>
      this.request<Invoice>(`/invoices/${id}/reissue`, { method: 'POST' }),
    cancel: (id: string) =>
      this.request<Invoice>(`/invoices/${id}/cancel`, { method: 'PATCH' }),
  };

  // Settings
  settings = {
    get: () => this.request<SiteSettings>('/storefront/settings'),
    update: (dto: Partial<SiteSettings>) =>
      this.request<SiteSettings>('/storefront/settings', { method: 'PUT', body: JSON.stringify(dto) }),
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
