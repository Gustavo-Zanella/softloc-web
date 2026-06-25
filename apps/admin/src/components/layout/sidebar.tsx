'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard, Users, Package, FileText, Receipt, Settings, UserCog, Tag, ChevronRight
} from 'lucide-react';
import { cn } from '@softloc/ui';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'ATENDENTE', 'FINANCEIRO'] },
  { href: '/admin/clientes', label: 'Clientes', icon: Users, roles: ['ADMIN', 'ATENDENTE', 'FINANCEIRO'] },
  { href: '/admin/produtos', label: 'Produtos', icon: Package, roles: ['ADMIN', 'ATENDENTE'] },
  { href: '/admin/categorias', label: 'Categorias', icon: Tag, roles: ['ADMIN', 'ATENDENTE'] },
  { href: '/admin/contratos', label: 'Contratos', icon: FileText, roles: ['ADMIN', 'ATENDENTE', 'FINANCEIRO'] },
  { href: '/admin/notas-fiscais', label: 'Notas Fiscais', icon: Receipt, roles: ['ADMIN', 'FINANCEIRO'] },
  { href: '/admin/configuracoes', label: 'Configurações do Site', icon: Settings, roles: ['ADMIN'] },
  { href: '/admin/usuarios', label: 'Usuários', icon: UserCog, roles: ['ADMIN'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as string | undefined;

  const visible = navItems.filter((item) => !role || item.roles.includes(role));

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 text-gray-100 flex flex-col z-40">
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="font-display text-lg font-bold text-brand-gold">SoftLoc</span>
        <p className="text-xs text-gray-400 mt-0.5">Painel Administrativo</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {visible.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-brand-gold text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  {active && <ChevronRight className="h-3 w-3 ml-auto" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-500">
        v0.1.0
      </div>
    </aside>
  );
}
