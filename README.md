# SoftLoc Web — Monorepo Frontend

Monorepo Turborepo com dois apps Next.js 15 para o sistema ERP de locação **SoftLoc**:

- **`apps/site`** — Vitrine pública (catálogo, contato, SEO)
- **`apps/admin`** — Painel administrativo (auth, dashboard, CRUD completo)

Comunicam com o backend NestJS via REST API.

---

## Estrutura

```
softloc-web/
├── apps/
│   ├── site/          # Next.js 15 — porta 3000
│   └── admin/         # Next.js 15 — porta 3001
├── packages/
│   ├── ui/            # Componentes compartilhados (shadcn/ui style)
│   └── types/         # Tipos TypeScript do domínio
├── nginx.conf         # Reverse proxy
├── docker-compose.yml # Orquestração dos serviços front
└── .env               # Variáveis de ambiente
```

---

## Configuração do ambiente

```bash
# 1. Clone o repositório
git clone <url> softloc-web && cd softloc-web

# 2. Copie e ajuste as variáveis
cp .env.example .env

# 3. Instale dependências
npm install
```

### Variáveis obrigatórias (`.env`)

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL pública da API (client-side) |
| `API_URL` | URL interna da API (SSR, apenas no Docker) |
| `NEXTAUTH_SECRET` | Secret JWT do NextAuth — gere com `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL do app admin (ex: `http://localhost:3001`) |

---

## Rodando em desenvolvimento

### Pré-requisito
O backend SoftLoc deve estar rodando na porta 3000:
```bash
# Na pasta do backend
docker compose up -d
```

### Subir os dois apps simultaneamente
```bash
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3001
- Login admin: use as credenciais do backend

### Subir apenas um app
```bash
npm run dev --filter=@softloc/site
npm run dev --filter=@softloc/admin
```

---

## Rodando com Docker (produção)

### Pré-requisito: rede Docker compartilhada com o backend

```bash
# Criar rede (apenas uma vez)
docker network create softloc-network

# O backend deve usar esta rede no seu docker-compose:
# networks:
#   softloc-network:
#     external: true
```

### Build e start

```bash
# Build das imagens
docker compose build

# Subir tudo (site + admin + nginx)
docker compose up -d

# Ver logs
docker compose logs -f site
docker compose logs -f admin
```

### URLs (com Nginx)

| Serviço | URL local | URL produção (exemplo) |
|---|---|---|
| Site público | http://localhost:80 | https://dominio.com |
| Admin | — | https://app.dominio.com |
| API | — | https://api.dominio.com |

> Configure os `server_name` no `nginx.conf` com seus domínios reais.

---

## Stack

| Tecnologia | Uso |
|---|---|
| Next.js 15 (App Router) | Framework dos dois apps |
| TypeScript | Tipagem end-to-end |
| Tailwind CSS | Estilização |
| shadcn/ui (Radix primitives) | Componentes do admin |
| TanStack Query v5 | Cache e sincronização com API |
| TanStack Table v8 | Tabelas do admin |
| React Hook Form + Zod | Formulários com validação |
| NextAuth.js v4 | Autenticação JWT (admin) |
| Recharts | Gráficos do dashboard |
| Sonner | Toasts (notificações) |
| Turborepo | Monorepo com cache inteligente |

---

## Funcionalidades

### Site Público (`apps/site`)
- Home com hero/banner configurável, categorias e produtos em destaque
- Catálogo com filtro por categoria e busca
- Detalhe de produto com galeria, verificador de disponibilidade e botão WhatsApp
- Página de categoria
- Formulário de contato com mapa incorporado
- SEO: `generateMetadata`, `sitemap.ts`, `robots.ts`
- Todas as configurações (textos, cores, banner, contato) vêm da API — editáveis pelo painel admin

### Painel Admin (`apps/admin`)
- Login com JWT (NextAuth credentials + cookie httpOnly)
- Middleware protegendo todas as rotas `/admin/*`
- Menu com visibilidade por papel (ADMIN / ATENDENTE / FINANCEIRO)
- **Dashboard**: métricas do mês, gráfico de receita, pizza de status, top produtos
- **Clientes**: CRUD PF/PJ com busca e paginação
- **Produtos**: CRUD com upload de imagem, toggle vitrine/destaque
- **Categorias**: CRUD simples
- **Contratos**: criação com verificação de disponibilidade em tempo real, fluxo de status (confirmar → iniciar → devolver), download de PDF
- **Notas Fiscais**: listagem, reemissão, cancelamento
- **Configurações do Site**: edição de todos os site_settings com campos visuais (color picker)
- **Usuários**: CRUD com papéis (apenas ADMIN vê este menu)

---

## Desenvolvimento

```bash
# Type-check todos os apps
npm run type-check

# Lint
npm run lint

# Build produção
npm run build

# Limpar caches do Turborepo
npm run clean
```
