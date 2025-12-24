'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
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
  Plus,
  Search,
  Moon,
  Sun,
  LogOut,
  User,
  HelpCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
  group: 'navigation' | 'actions' | 'settings';
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const navigationItems: CommandItem[] = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: Home,
      shortcut: '⌘D',
      action: () => router.push('/dashboard'),
      keywords: ['home', 'main', 'overview'],
      group: 'navigation',
    },
    {
      id: 'leads',
      label: 'Go to Leads',
      icon: Users,
      shortcut: '⌘L',
      action: () => router.push('/dashboard/leads'),
      keywords: ['contacts', 'prospects', 'sales'],
      group: 'navigation',
    },
    {
      id: 'companies',
      label: 'Go to Companies',
      icon: Building2,
      action: () => router.push('/dashboard/companies'),
      keywords: ['organizations', 'accounts', 'businesses'],
      group: 'navigation',
    },
    {
      id: 'pipeline',
      label: 'Go to Pipeline',
      icon: Kanban,
      shortcut: '⌘P',
      action: () => router.push('/dashboard/pipeline'),
      keywords: ['deals', 'stages', 'kanban'],
      group: 'navigation',
    },
    {
      id: 'tasks',
      label: 'Go to Tasks',
      icon: CheckSquare,
      shortcut: '⌘T',
      action: () => router.push('/dashboard/tasks'),
      keywords: ['todos', 'activities', 'followups'],
      group: 'navigation',
    },
    {
      id: 'proposals',
      label: 'Go to Proposals',
      icon: FileText,
      action: () => router.push('/dashboard/proposals'),
      keywords: ['quotes', 'estimates', 'pricing'],
      group: 'navigation',
    },
    {
      id: 'projects',
      label: 'Go to Projects',
      icon: FolderKanban,
      action: () => router.push('/dashboard/projects'),
      keywords: ['work', 'deliverables', 'clients'],
      group: 'navigation',
    },
    {
      id: 'automation',
      label: 'Go to Automation',
      icon: Zap,
      action: () => router.push('/dashboard/automation'),
      keywords: ['workflows', 'triggers', 'rules'],
      group: 'navigation',
    },
    {
      id: 'settings',
      label: 'Go to Settings',
      icon: Settings,
      action: () => router.push('/dashboard/settings'),
      keywords: ['preferences', 'configuration', 'account'],
      group: 'navigation',
    },
  ];

  const actionItems: CommandItem[] = [
    {
      id: 'new-lead',
      label: 'Create New Lead',
      icon: Plus,
      shortcut: '⌘N',
      action: () => router.push('/dashboard/leads?action=add'),
      keywords: ['add', 'new', 'contact'],
      group: 'actions',
    },
    {
      id: 'new-task',
      label: 'Create New Task',
      icon: Plus,
      action: () => router.push('/dashboard/tasks?action=add'),
      keywords: ['add', 'todo', 'reminder'],
      group: 'actions',
    },
    {
      id: 'new-company',
      label: 'Create New Company',
      icon: Plus,
      action: () => router.push('/dashboard/companies?action=add'),
      keywords: ['add', 'organization', 'account'],
      group: 'actions',
    },
    {
      id: 'new-proposal',
      label: 'Create New Proposal',
      icon: Plus,
      action: () => router.push('/dashboard/proposals?action=add'),
      keywords: ['add', 'quote', 'estimate'],
      group: 'actions',
    },
  ];

  const settingsItems: CommandItem[] = [
    {
      id: 'theme-light',
      label: 'Switch to Light Mode',
      icon: Sun,
      action: () => setTheme('light'),
      keywords: ['theme', 'appearance', 'bright'],
      group: 'settings',
    },
    {
      id: 'theme-dark',
      label: 'Switch to Dark Mode',
      icon: Moon,
      action: () => setTheme('dark'),
      keywords: ['theme', 'appearance', 'night'],
      group: 'settings',
    },
    {
      id: 'profile',
      label: 'View Profile',
      icon: User,
      action: () => router.push('/dashboard/settings'),
      keywords: ['account', 'user', 'me'],
      group: 'settings',
    },
    {
      id: 'help',
      label: 'Get Help',
      icon: HelpCircle,
      action: () => window.open('https://docs.automaire.com', '_blank'),
      keywords: ['support', 'documentation', 'faq'],
      group: 'settings',
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => runCommand(item.action)}
              className="flex items-center gap-3"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {actionItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => runCommand(item.action)}
              className="flex items-center gap-3"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          {settingsItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => runCommand(item.action)}
              className="flex items-center gap-3"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// Keyboard shortcut hint component
export function CommandPaletteHint() {
  return (
    <button
      onClick={() => {
        const event = new KeyboardEvent('keydown', {
          key: 'k',
          metaKey: true,
        });
        document.dispatchEvent(event);
      }}
      className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 rounded-md hover:bg-muted transition-colors"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Search...</span>
      <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
