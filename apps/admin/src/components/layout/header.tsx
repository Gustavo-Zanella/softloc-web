'use client';

import { signOut, useSession } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@softloc/ui';

export function AdminHeader() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as string | undefined;

  return (
    <header className="fixed top-0 right-0 left-64 h-14 bg-white border-b z-30 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="text-right">
            <p className="font-medium leading-tight">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
