'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Users,
  Building2,
  Kanban,
  CheckSquare,
  FileText,
  FolderKanban,
  Zap,
  Settings,
  Home,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Separator } from '@/components/ui/separator';
import { WorkspaceProvider } from '@/providers/WorkspaceProvider';

// Dynamic imports with SSR disabled to prevent hydration errors from Radix UI
const CommandPalette = dynamic(() => import('@/components/CommandPalette').then(mod => mod.CommandPalette), { ssr: false });
const CommandPaletteHint = dynamic(() => import('@/components/CommandPalette').then(mod => mod.CommandPaletteHint), { ssr: false });

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const allNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: Home },
  { title: 'Leads', href: '/dashboard/leads', icon: Users },
  { title: 'Companies', href: '/dashboard/companies', icon: Building2 },
  { title: 'Pipeline', href: '/dashboard/pipeline', icon: Kanban },
  { title: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { title: 'Proposals', href: '/dashboard/proposals', icon: FileText },
  { title: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { title: 'Automation', href: '/dashboard/automation', icon: Zap },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Get current page title
  const currentPage = allNavItems.find(item => {
    if (item.href === '/dashboard') return pathname === '/dashboard';
    return pathname === item.href || pathname.startsWith(item.href + '/');
  });

  return (
    <WorkspaceProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{currentPage?.title || 'Dashboard'}</h1>
            </div>
            <CommandPaletteHint />
            <ThemeToggle />
          </header>
          <CommandPalette />

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
