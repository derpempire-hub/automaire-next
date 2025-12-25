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
  Lock,
  ClipboardList,
  LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/useEntitlements';
import { Logo } from '@/components/Logo';
import { WorkspaceSwitcher } from '@/components/workspace/WorkspaceSwitcher';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  requiresAdmin?: boolean;
  requiresInternalAdmin?: boolean;
  requiresEntitlement?: string;
  lockedBehavior?: 'hide' | 'disable';
  lockedReason?: string;
  requiredTier?: string;
}

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Leads', url: '/dashboard/leads', icon: Users },
  { title: 'Companies', url: '/dashboard/companies', icon: Building2 },
  { title: 'Pipeline', url: '/dashboard/pipeline', icon: Kanban },
  { title: 'Tasks', url: '/dashboard/tasks', icon: CheckSquare },
];

const projectNavItems: NavItem[] = [
  { title: 'Proposals', url: '/dashboard/proposals', icon: FileText },
  { title: 'Projects', url: '/dashboard/projects', icon: FolderKanban },
  { title: 'Service Requests', url: '/dashboard/service-requests', icon: ClipboardList },
];

const systemNavItems: NavItem[] = [
  {
    title: 'Automation',
    url: '/dashboard/automation',
    icon: Zap,
    requiresEntitlement: 'workflow_builder_enabled',
    lockedBehavior: 'disable',
    lockedReason: 'Automation requires Pro plan or higher',
    requiredTier: 'Pro',
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
    requiresInternalAdmin: true,
    lockedBehavior: 'hide',
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { isInternalAdmin, workflowBuilderEnabled, role } = usePermissions();

  const isItemAccessible = (item: NavItem): boolean => {
    if (item.requiresInternalAdmin && !isInternalAdmin) return false;
    if (item.requiresAdmin && !isInternalAdmin) return false;
    if (item.requiresEntitlement === 'workflow_builder_enabled' && !workflowBuilderEnabled) return false;
    return true;
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname === path || pathname.startsWith(path + '/');
  };

  const getInitials = (email?: string) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.url);
    const accessible = isItemAccessible(item);

    if (!accessible && item.lockedBehavior === 'hide') return null;

    if (!accessible && item.lockedBehavior === 'disable') {
      return (
        <SidebarMenuItem key={item.title}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-not-allowed">
                <SidebarMenuButton disabled className="opacity-50 pointer-events-none">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {!collapsed && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
                </SidebarMenuButton>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-medium flex items-center gap-1.5">
                  <Lock className="h-3 w-3" />
                  {item.lockedReason || `${item.title} is locked`}
                </p>
                {item.requiredTier && (
                  <p className="text-xs text-muted-foreground">
                    Available on {item.requiredTier} plan and above
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
          <Link
            href={item.url}
            className={cn(
              'hover:bg-sidebar-accent/50',
              active && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const filterVisibleItems = (items: NavItem[]) =>
    items.filter((item) => !((!isItemAccessible(item) && item.lockedBehavior === 'hide')));

  const visibleMainItems = filterVisibleItems(mainNavItems);
  const visibleProjectItems = filterVisibleItems(projectNavItems);
  const visibleSystemItems = filterVisibleItems(systemNavItems);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={collapsed ? 'border-b border-sidebar-border p-2' : 'border-b border-sidebar-border p-4'}>
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <Logo to="/dashboard" size="xl" className="flex-shrink-0" />
          </div>
        )}
        <WorkspaceSwitcher collapsed={collapsed} />
      </SidebarHeader>

      <SidebarContent>
        {visibleMainItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{mainNavItems.map(renderNavItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleProjectItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{projectNavItems.map(renderNavItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleSystemItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{systemNavItems.map(renderNavItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(user?.email)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              {role && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                  {role.replace('_', ' ')}
                </Badge>
              )}
            </div>
          )}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground absolute right-3"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
