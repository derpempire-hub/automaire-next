'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Settings,
  AlertCircle,
  Check,
  HelpCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getNodeDefinition, NODE_CATEGORIES } from '@/lib/workflow/nodeRegistry';
import type {
  WorkflowNode,
  WorkflowNodeType,
  ConfigFieldDefinition,
  NodeCategory,
} from '@/lib/workflow/types';

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: Record<string, unknown>) => void;
  className?: string;
}

interface FieldValue {
  [key: string]: string | number | boolean | unknown;
}

export function NodeConfigPanel({
  node,
  onClose,
  onUpdate,
  className,
}: NodeConfigPanelProps) {
  const [values, setValues] = useState<FieldValue>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get node definition
  const nodeDefinition = node ? getNodeDefinition(node.type as WorkflowNodeType) : null;
  const categoryInfo = nodeDefinition ? NODE_CATEGORIES[nodeDefinition.category as NodeCategory] : null;

  // Initialize values from node data
  useEffect(() => {
    if (node?.data) {
      const nodeData = node.data as unknown as Record<string, unknown>;
      const initialValues: FieldValue = {};

      // Extract config values if they exist
      const config = (nodeData.config || {}) as Record<string, unknown>;

      nodeDefinition?.configFields.forEach((field) => {
        if (config[field.name] !== undefined) {
          initialValues[field.name] = config[field.name] as string | number | boolean;
        } else if (field.defaultValue !== undefined) {
          initialValues[field.name] = field.defaultValue as string | number | boolean;
        } else {
          initialValues[field.name] = '';
        }
      });

      setValues(initialValues);
    }
  }, [node?.id, node?.data, nodeDefinition]);

  // Handle field change
  const handleFieldChange = (fieldName: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));

    // Clear error when field is modified
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  // Validate and save
  const handleSave = () => {
    if (!node || !nodeDefinition) return;

    const newErrors: Record<string, string> = {};

    // Validate required fields
    nodeDefinition.configFields.forEach((field) => {
      if (field.required && !values[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Build updated node data
    const nodeData = node.data as unknown as Record<string, unknown>;
    const updatedData = {
      ...nodeData,
      config: values,
      isConfigured: true,
      hasErrors: false,
      errors: [],
    };

    onUpdate(node.id, updatedData);
  };

  // Render field based on type
  const renderField = (field: ConfigFieldDefinition) => {
    const value = values[field.name];
    const error = errors[field.name];

    const fieldId = `field-${field.name}`;

    return (
      <div key={field.name} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={fieldId} className="text-sm font-medium flex items-center gap-1.5">
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
            {field.helpText && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  {field.helpText}
                </TooltipContent>
              </Tooltip>
            )}
          </Label>
        </div>

        {field.type === 'text' || field.type === 'variable_picker' ? (
          <Input
            id={fieldId}
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={cn(error && 'border-destructive')}
          />
        ) : field.type === 'textarea' ? (
          <Textarea
            id={fieldId}
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={cn('min-h-[100px]', error && 'border-destructive')}
          />
        ) : field.type === 'number' ? (
          <Input
            id={fieldId}
            type="number"
            value={(value as number) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.valueAsNumber || '')}
            placeholder={field.placeholder}
            className={cn(error && 'border-destructive')}
          />
        ) : field.type === 'select' ? (
          <Select
            value={(value as string) || ''}
            onValueChange={(v) => handleFieldChange(field.name, v)}
          >
            <SelectTrigger className={cn(error && 'border-destructive')}>
              <SelectValue placeholder={field.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === 'boolean' ? (
          <div className="flex items-center gap-2">
            <Switch
              id={fieldId}
              checked={(value as boolean) || false}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
            <Label htmlFor={fieldId} className="text-sm text-muted-foreground">
              {value ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        ) : field.type === 'json' ? (
          <Textarea
            id={fieldId}
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={cn('min-h-[100px] font-mono text-xs', error && 'border-destructive')}
          />
        ) : field.type === 'condition_builder' ? (
          <div className="p-3 border rounded-md bg-muted/30 text-sm text-muted-foreground">
            Condition builder coming soon...
          </div>
        ) : null}

        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    );
  };

  if (!node || !nodeDefinition) {
    return (
      <div className={cn('flex flex-col h-full bg-card border-l', className)}>
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Node Configuration
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="text-muted-foreground">
            <Settings className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Select a node to configure</p>
          </div>
        </div>
      </div>
    );
  }

  const nodeData = node.data as { label?: string; isConfigured?: boolean };

  return (
    <div className={cn('flex flex-col h-full bg-card border-l', className)}>
      {/* Header */}
      <div className="p-4 border-b flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {categoryInfo && (
              <div
                className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  categoryInfo.color
                )}
              />
            )}
            <h3 className="font-semibold truncate">{nodeData.label || nodeDefinition.label}</h3>
          </div>
          <p className="text-xs text-muted-foreground">{nodeDefinition.description}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Status Badge */}
      <div className="px-4 py-2 border-b bg-muted/30">
        {nodeData.isConfigured ? (
          <Badge variant="outline" className="text-xs gap-1">
            <Check className="h-3 w-3 text-green-500" />
            Configured
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs gap-1">
            <AlertCircle className="h-3 w-3" />
            Needs Configuration
          </Badge>
        )}
      </div>

      {/* Config Fields */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {nodeDefinition.configFields.length > 0 ? (
            nodeDefinition.configFields.map(renderField)
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              This node has no configuration options
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {nodeDefinition.configFields.length > 0 && (
        <>
          <Separator />
          <div className="p-4">
            <Button onClick={handleSave} className="w-full">
              <Check className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
