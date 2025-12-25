'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  NODE_CATEGORIES,
  getNodesByCategory,
} from '@/lib/workflow/nodeRegistry';
import type { NodeCategory, NodeDefinition, WorkflowNodeType } from '@/lib/workflow/types';
import {
  Search,
  UserPlus,
  FileText,
  Calendar,
  Webhook,
  Play,
  Mail,
  Database,
  CheckSquare,
  Globe,
  MessageSquare,
  Hash,
  GitBranch,
  Clock,
  Repeat,
  GitFork,
  Brain,
  Heart,
  Sparkles,
  Tags,
} from 'lucide-react';

// Icon mapping
const ICON_MAP: Record<string, React.ReactNode> = {
  UserPlus: <UserPlus className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  Webhook: <Webhook className="h-4 w-4" />,
  Play: <Play className="h-4 w-4" />,
  Mail: <Mail className="h-4 w-4" />,
  Database: <Database className="h-4 w-4" />,
  CheckSquare: <CheckSquare className="h-4 w-4" />,
  Globe: <Globe className="h-4 w-4" />,
  MessageSquare: <MessageSquare className="h-4 w-4" />,
  Hash: <Hash className="h-4 w-4" />,
  GitBranch: <GitBranch className="h-4 w-4" />,
  Clock: <Clock className="h-4 w-4" />,
  Repeat: <Repeat className="h-4 w-4" />,
  GitFork: <GitFork className="h-4 w-4" />,
  Brain: <Brain className="h-4 w-4" />,
  Heart: <Heart className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
  Tags: <Tags className="h-4 w-4" />,
};

interface NodeLibraryPanelProps {
  className?: string;
}

function NodeItem({ node }: { node: NodeDefinition }) {
  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/workflow-node', node.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  const icon = ICON_MAP[node.icon] || <Globe className="h-4 w-4" />;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'flex items-center gap-3 p-2.5 rounded-lg cursor-grab',
        'border border-transparent',
        'hover:bg-muted/50 hover:border-border',
        'transition-colors duration-150',
        'active:cursor-grabbing active:opacity-70'
      )}
    >
      <div
        className={cn(
          'p-2 rounded-md flex items-center justify-center text-white flex-shrink-0',
          node.color
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{node.label}</p>
        <p className="text-xs text-muted-foreground truncate">
          {node.description}
        </p>
      </div>
    </div>
  );
}

export function NodeLibraryPanel({ className }: NodeLibraryPanelProps) {
  const [search, setSearch] = useState('');

  // Get nodes by category
  const nodesByCategory = useMemo(() => {
    const categories: Record<NodeCategory, NodeDefinition[]> = {
      triggers: getNodesByCategory('triggers'),
      actions: getNodesByCategory('actions'),
      logic: getNodesByCategory('logic'),
      ai: getNodesByCategory('ai'),
      integrations: getNodesByCategory('integrations'),
    };
    return categories;
  }, []);

  // Filter nodes based on search
  const filteredCategories = useMemo(() => {
    if (!search.trim()) {
      return nodesByCategory;
    }

    const searchLower = search.toLowerCase();
    const filtered: Record<NodeCategory, NodeDefinition[]> = {
      triggers: [],
      actions: [],
      logic: [],
      ai: [],
      integrations: [],
    };

    for (const category of Object.keys(nodesByCategory) as NodeCategory[]) {
      filtered[category] = nodesByCategory[category].filter(
        (node) =>
          node.label.toLowerCase().includes(searchLower) ||
          node.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [search, nodesByCategory]);

  // Get default open categories
  const defaultOpen = useMemo(() => {
    return Object.entries(filteredCategories)
      .filter(([, nodes]) => nodes.length > 0)
      .map(([category]) => category);
  }, [filteredCategories]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {/* Node categories */}
      <ScrollArea className="flex-1">
        <Accordion
          type="multiple"
          defaultValue={defaultOpen}
          className="px-2 py-2"
        >
          {(Object.entries(NODE_CATEGORIES) as [NodeCategory, typeof NODE_CATEGORIES[NodeCategory]][]).map(
            ([category, meta]) => {
              const nodes = filteredCategories[category];
              if (nodes.length === 0) return null;

              return (
                <AccordionItem
                  key={category}
                  value={category}
                  className="border-none"
                >
                  <AccordionTrigger className="py-2 px-2 hover:no-underline hover:bg-muted/50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          meta.color
                        )}
                      />
                      <span className="font-medium">{meta.label}</span>
                      <span className="text-xs text-muted-foreground">
                        ({nodes.length})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2 pt-1">
                    <div className="space-y-1">
                      {nodes.map((node) => (
                        <NodeItem key={node.type} node={node} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            }
          )}
        </Accordion>

        {/* Empty state */}
        {Object.values(filteredCategories).every((nodes) => nodes.length === 0) && (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No nodes found for "{search}"
          </div>
        )}
      </ScrollArea>

      {/* Help text */}
      <div className="p-3 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Drag nodes onto the canvas to build your workflow
        </p>
      </div>
    </div>
  );
}
