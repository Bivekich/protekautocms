import React from 'react';
import { vi } from 'vitest';

// Мокаем UI компоненты, которые используются в компонентах каталога
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => React.createElement('button', props, children),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => React.createElement('input', props),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => React.createElement('label', props, children),
}));

vi.mock('@/components/ui/switch', () => ({
  Switch: (props: any) => React.createElement('input', { type: 'checkbox', role: 'switch', ...props }),
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: (props: any) => React.createElement('input', { type: 'checkbox', ...props }),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, ...props }: any) => React.createElement('div', props, children),
  TabsList: ({ children, ...props }: any) => React.createElement('div', { role: 'tablist', ...props }, children),
  TabsTrigger: ({ children, value, ...props }: any) => React.createElement('button', { role: 'tab', 'data-value': value, 'data-state': props['data-state'] || 'inactive', ...props }, children),
  TabsContent: ({ children, value, ...props }: any) => React.createElement('div', { role: 'tabpanel', 'data-value': value, 'data-state': props['data-state'] || 'inactive', ...props }, children),
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children, ...props }: any) => React.createElement('table', props, children),
  TableHeader: ({ children, ...props }: any) => React.createElement('thead', props, children),
  TableBody: ({ children, ...props }: any) => React.createElement('tbody', props, children),
  TableRow: ({ children, ...props }: any) => React.createElement('tr', props, children),
  TableHead: ({ children, ...props }: any) => React.createElement('th', props, children),
  TableCell: ({ children, ...props }: any) => React.createElement('td', props, children),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, ...props }: any) => React.createElement('select', props, children),
  SelectTrigger: ({ children, ...props }: any) => React.createElement('button', props, children),
  SelectValue: ({ children, ...props }: any) => React.createElement('span', props, children),
  SelectContent: ({ children, ...props }: any) => React.createElement('div', props, children),
  SelectItem: ({ children, value, ...props }: any) => React.createElement('option', { value, ...props }, children),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children, ...props }: any) => React.createElement('div', props, children),
  PopoverTrigger: ({ children, ...props }: any) => React.createElement('button', props, children),
  PopoverContent: ({ children, ...props }: any) => React.createElement('div', props, children),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, ...props }: any) => React.createElement('div', props, children),
  DialogTrigger: ({ children, ...props }: any) => React.createElement('button', props, children),
  DialogContent: ({ children, ...props }: any) => React.createElement('div', { role: 'dialog', ...props }, children),
  DialogHeader: ({ children, ...props }: any) => React.createElement('div', props, children),
  DialogTitle: ({ children, ...props }: any) => React.createElement('h2', props, children),
  DialogFooter: ({ children, ...props }: any) => React.createElement('div', props, children),
}));

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, ...props }: any) => React.createElement('div', props, children),
  AlertDialogTrigger: ({ children, ...props }: any) => React.createElement('button', props, children),
  AlertDialogContent: ({ children, ...props }: any) => React.createElement('div', { role: 'alertdialog', ...props }, children),
  AlertDialogHeader: ({ children, ...props }: any) => React.createElement('div', props, children),
  AlertDialogTitle: ({ children, ...props }: any) => React.createElement('h2', props, children),
  AlertDialogDescription: ({ children, ...props }: any) => React.createElement('p', props, children),
  AlertDialogFooter: ({ children, ...props }: any) => React.createElement('div', props, children),
  AlertDialogAction: ({ children, ...props }: any) => React.createElement('button', props, children),
  AlertDialogCancel: ({ children, ...props }: any) => React.createElement('button', props, children),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children, ...props }: any) => React.createElement('div', props, children),
  DropdownMenuTrigger: ({ children, ...props }: any) => React.createElement('button', props, children),
  DropdownMenuContent: ({ children, ...props }: any) => React.createElement('div', props, children),
  DropdownMenuItem: ({ children, ...props }: any) => React.createElement('button', props, children),
  DropdownMenuSeparator: (props: any) => React.createElement('hr', props),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => React.createElement('textarea', props),
}));

// Мокаем другие часто используемые UI компоненты
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => React.createElement('img', props),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => ''),
})); 