'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
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
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/useEntitlements';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAdmin?: boolean;
}

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: Home },
  { title: 'Leads', href: '/dashboard/leads', icon: Users },
  { title: 'Companies', href: '/dashboard/companies', icon: Building2 },
  { title: 'Pipeline', href: '/dashboard/pipeline', icon: Kanban },
  { title: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
];

const projectNavItems: NavItem[] = [
  { title: 'Proposals', href: '/dashboard/proposals', icon: FileText },
  { title: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
];

const systemNavItems: NavItem[] = [
  { title: 'Automation', href: '/dashboard/automation', icon: Zap },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings, requiresAdmin: true },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  const { isInternalAdmin } = usePermissions();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderNavItem = (item: NavItem) => {
    if (item.requiresAdmin && !isInternalAdmin) return null;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive(item.href)
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.title}
      </Link>
    );
  };

  return (
    <nav className="flex-1 space-y-6 p-4">
      <div className="space-y-1">
        <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Main</p>
        {mainNavItems.map(renderNavItem)}
      </div>
      <div className="space-y-1">
        <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Projects</p>
        {projectNavItems.map(renderNavItem)}
      </div>
      <div className="space-y-1">
        <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">System</p>
        {systemNavItems.map(renderNavItem)}
      </div>
    </nav>
  );
}

function Sidebar() {
  const { user, signOut } = useAuth();

  const getInitials = (email?: string) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Logo to="/dashboard" size="md" />
      </div>
      <NavLinks />
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileNav() {
  const { user, signOut } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex h-14 items-center border-b px-4">
          <Logo to="/dashboard" size="md" />
        </div>
        <NavLinks />
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {user?.email?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="h-8 w-8"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Get current page title
  const allNavItems = [...mainNavItems, ...projectNavItems, ...systemNavItems];
  const currentPage = allNavItems.find(item => {
    if (item.href === '/dashboard') return pathname === '/dashboard';
    return pathname === item.href || pathname.startsWith(item.href + '/');
  });

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
          <MobileNav />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{currentPage?.title || 'Dashboard'}</h1>
          </div>
          <ThemeToggle />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
