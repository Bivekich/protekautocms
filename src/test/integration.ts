import { vi } from 'vitest';

// Мокаем все UI компоненты
vi.mock('@/components/ui/tabs', () => {
  return {
    Tabs: ({ children, ...props }: any) => {
      return <div data-testid="mock-tabs" {...props}>{children}</div>;
    },
    TabsList: ({ children, ...props }: any) => {
      return <div data-testid="mock-tabs-list" role="tablist" {...props}>{children}</div>;
    },
    TabsTrigger: ({ children, value, ...props }: any) => {
      return <button data-testid="mock-tabs-trigger" role="tab" data-value={value} data-state={props['data-state'] || 'inactive'} {...props}>{children}</button>;
    },
    TabsContent: ({ children, value, ...props }: any) => {
      return <div data-testid="mock-tabs-content" role="tabpanel" data-value={value} data-state={props['data-state'] || 'inactive'} {...props}>{children}</div>;
    },
  };
});

vi.mock('@/components/ui/button', () => {
  return {
    Button: ({ children, ...props }: any) => {
      return <button data-testid="mock-button" {...props}>{children}</button>;
    },
  };
});

vi.mock('@/components/ui/input', () => {
  return {
    Input: (props: any) => {
      return <input data-testid="mock-input" {...props} />;
    },
  };
});

vi.mock('@/components/ui/checkbox', () => {
  return {
    Checkbox: (props: any) => {
      return <input data-testid="mock-checkbox" type="checkbox" {...props} />;
    },
  };
});

vi.mock('@/components/ui/switch', () => {
  return {
    Switch: (props: any) => {
      return <input data-testid="mock-switch" type="checkbox" role="switch" {...props} />;
    },
  };
});

vi.mock('@/components/ui/table', () => {
  return {
    Table: ({ children, ...props }: any) => {
      return <table data-testid="mock-table" {...props}>{children}</table>;
    },
    TableHeader: ({ children, ...props }: any) => {
      return <thead data-testid="mock-table-header" {...props}>{children}</thead>;
    },
    TableBody: ({ children, ...props }: any) => {
      return <tbody data-testid="mock-table-body" {...props}>{children}</tbody>;
    },
    TableRow: ({ children, ...props }: any) => {
      return <tr data-testid="mock-table-row" {...props}>{children}</tr>;
    },
    TableHead: ({ children, ...props }: any) => {
      return <th data-testid="mock-table-head" {...props}>{children}</th>;
    },
    TableCell: ({ children, ...props }: any) => {
      return <td data-testid="mock-table-cell" {...props}>{children}</td>;
    },
  };
});

vi.mock('@/components/ui/select', () => {
  return {
    Select: ({ children, ...props }: any) => {
      return <div data-testid="mock-select" {...props}>{children}</div>;
    },
    SelectTrigger: ({ children, ...props }: any) => {
      return <button data-testid="mock-select-trigger" {...props}>{children}</button>;
    },
    SelectValue: ({ children, ...props }: any) => {
      return <span data-testid="mock-select-value" {...props}>{children}</span>;
    },
    SelectContent: ({ children, ...props }: any) => {
      return <div data-testid="mock-select-content" {...props}>{children}</div>;
    },
    SelectItem: ({ children, value, ...props }: any) => {
      return <div data-testid="mock-select-item" data-value={value} {...props}>{children}</div>;
    },
  };
});

vi.mock('@/components/ui/popover', () => {
  return {
    Popover: ({ children, ...props }: any) => {
      return <div data-testid="mock-popover" {...props}>{children}</div>;
    },
    PopoverTrigger: ({ children, ...props }: any) => {
      return <button data-testid="mock-popover-trigger" {...props}>{children}</button>;
    },
    PopoverContent: ({ children, ...props }: any) => {
      return <div data-testid="mock-popover-content" {...props}>{children}</div>;
    },
  };
});

vi.mock('@/components/ui/dialog', () => {
  return {
    Dialog: ({ children, ...props }: any) => {
      return <div data-testid="mock-dialog" {...props}>{children}</div>;
    },
    DialogTrigger: ({ children, ...props }: any) => {
      return <button data-testid="mock-dialog-trigger" {...props}>{children}</button>;
    },
    DialogContent: ({ children, ...props }: any) => {
      return <div data-testid="mock-dialog-content" {...props}>{children}</div>;
    },
    DialogHeader: ({ children, ...props }: any) => {
      return <div data-testid="mock-dialog-header" {...props}>{children}</div>;
    },
    DialogTitle: ({ children, ...props }: any) => {
      return <h2 data-testid="mock-dialog-title" {...props}>{children}</h2>;
    },
    DialogFooter: ({ children, ...props }: any) => {
      return <div data-testid="mock-dialog-footer" {...props}>{children}</div>;
    },
  };
});

vi.mock('@/components/ui/alert-dialog', () => {
  return {
    AlertDialog: ({ children, ...props }: any) => {
      return <div data-testid="mock-alert-dialog" {...props}>{children}</div>;
    },
    AlertDialogTrigger: ({ children, ...props }: any) => {
      return <button data-testid="mock-alert-dialog-trigger" {...props}>{children}</button>;
    },
    AlertDialogContent: ({ children, ...props }: any) => {
      return <div data-testid="mock-alert-dialog-content" {...props}>{children}</div>;
    },
    AlertDialogHeader: ({ children, ...props }: any) => {
      return <div data-testid="mock-alert-dialog-header" {...props}>{children}</div>;
    },
    AlertDialogTitle: ({ children, ...props }: any) => {
      return <h2 data-testid="mock-alert-dialog-title" {...props}>{children}</h2>;
    },
    AlertDialogDescription: ({ children, ...props }: any) => {
      return <p data-testid="mock-alert-dialog-description" {...props}>{children}</p>;
    },
    AlertDialogFooter: ({ children, ...props }: any) => {
      return <div data-testid="mock-alert-dialog-footer" {...props}>{children}</div>;
    },
    AlertDialogAction: ({ children, ...props }: any) => {
      return <button data-testid="mock-alert-dialog-action" {...props}>{children}</button>;
    },
    AlertDialogCancel: ({ children, ...props }: any) => {
      return <button data-testid="mock-alert-dialog-cancel" {...props}>{children}</button>;
    },
  };
});

vi.mock('@/components/ui/dropdown-menu', () => {
  return {
    DropdownMenu: ({ children, ...props }: any) => {
      return <div data-testid="mock-dropdown-menu" {...props}>{children}</div>;
    },
    DropdownMenuTrigger: ({ children, ...props }: any) => {
      return <button data-testid="mock-dropdown-menu-trigger" {...props}>{children}</button>;
    },
    DropdownMenuContent: ({ children, ...props }: any) => {
      return <div data-testid="mock-dropdown-menu-content" {...props}>{children}</div>;
    },
    DropdownMenuItem: ({ children, ...props }: any) => {
      return <button data-testid="mock-dropdown-menu-item" {...props}>{children}</button>;
    },
    DropdownMenuSeparator: (props: any) => {
      return <hr data-testid="mock-dropdown-menu-separator" {...props} />;
    },
  };
});

vi.mock('@/components/ui/textarea', () => {
  return {
    Textarea: (props: any) => {
      return <textarea data-testid="mock-textarea" {...props} />;
    },
  };
});

vi.mock('@/components/ui/label', () => {
  return {
    Label: ({ children, ...props }: any) => {
      return <label data-testid="mock-label" {...props}>{children}</label>;
    },
  };
});

// Мокаем другие часто используемые компоненты
vi.mock('sonner', () => {
  return {
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  };
}); 