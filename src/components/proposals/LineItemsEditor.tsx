'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  disabled?: boolean;
}

export function LineItemsEditor({ items, onChange, disabled }: LineItemsEditorProps) {
  const addItem = () => {
    onChange([...items, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const calculateTotal = (item: LineItem) => {
    return item.quantity * item.unit_price;
  };

  const subtotal = items.reduce((sum, item) => sum + calculateTotal(item), 0);

  const formatCurrency = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
        <div className="col-span-5">Description</div>
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-2 text-right">Unit Price</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1"></div>
      </div>

      {/* Line Items */}
      {items.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm border rounded-md bg-muted/20">
          No line items yet. Add items below.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <Input
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  disabled={disabled}
                  className="text-center"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  disabled={disabled}
                  className="text-right"
                />
              </div>
              <div className="col-span-2 text-right font-medium text-sm">
                {formatCurrency(calculateTotal(item))}
              </div>
              <div className="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={disabled}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Line Item
      </Button>

      {/* Subtotal */}
      {items.length > 0 && (
        <div className="flex justify-end pt-2 border-t">
          <div className="text-sm">
            <span className="text-muted-foreground mr-4">Subtotal:</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
