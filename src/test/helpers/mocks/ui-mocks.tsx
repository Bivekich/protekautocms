import React from 'react';
import { vi } from 'vitest';

// Мок для UI компонентов
export const Button = vi.fn(({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button {...props}>{children}</button>
));

export const Input = vi.fn(({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} />
));

export const Label = vi.fn(({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { children: React.ReactNode }) => (
  <label {...props}>{children}</label>
));

export const Switch = vi.fn(({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input type="checkbox" role="switch" {...props} />
));

export const Checkbox = vi.fn(({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input type="checkbox" {...props} />
));

export const Tabs = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div {...props}>{children}</div>
));

export const TabsList = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div role="tablist" {...props}>{children}</div>
));

export const TabsTrigger = vi.fn(({ children, value, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode, value: string }) => (
  <button role="tab" data-value={value} data-state={props['data-state'] || 'inactive'} {...props}>{children}</button>
));

export const TabsContent = vi.fn(({ children, value, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode, value: string }) => (
  <div role="tabpanel" data-value={value} data-state={props['data-state'] || 'inactive'} {...props}>{children}</div>
));

export const Table = vi.fn(({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement> & { children: React.ReactNode }) => (
  <table {...props}>{children}</table>
));

export const TableHeader = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement> & { children: React.ReactNode }) => (
  <thead {...props}>{children}</thead>
));

export const TableBody = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement> & { children: React.ReactNode }) => (
  <tbody {...props}>{children}</tbody>
));

export const TableRow = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement> & { children: React.ReactNode }) => (
  <tr {...props}>{children}</tr>
));

export const TableHead = vi.fn(({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement> & { children: React.ReactNode }) => (
  <th {...props}>{children}</th>
));

export const TableCell = vi.fn(({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement> & { children: React.ReactNode }) => (
  <td {...props}>{children}</td>
));

export const Select = vi.fn(({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select {...props}>{children}</select>
));

export const SelectTrigger = vi.fn(({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button {...props}>{children}</button>
));

export const SelectValue = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLSpanElement> & { children: React.ReactNode }) => (
  <span {...props}>{children}</span>
));

export const SelectContent = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div {...props}>{children}</div>
));

export const SelectItem = vi.fn(({ children, value, ...props }: React.OptionHTMLAttributes<HTMLOptionElement> & { children: React.ReactNode, value: string }) => (
  <option value={value} {...props}>{children}</option>
));

export const Popover = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div {...props}>{children}</div>
));

export const PopoverTrigger = vi.fn(({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button {...props}>{children}</button>
));

export const PopoverContent = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div {...props}>{children}</div>
));

export const Dialog = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div {...props}>{children}</div>
));

export const DialogTrigger = vi.fn(({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button {...props}>{children}</button>
));

export const DialogContent = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div role="dialog" {...props}>{children}</div>
));

export const DialogHeader = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div {...props}>{children}</div>
));

export const DialogTitle = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { children: React.ReactNode }) => (
  <h2 {...props}>{children}</h2>
));

export const DialogFooter = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div {...props}>{children}</div>
));

export const AlertDialog = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div {...props}>{children}</div>
));

export const AlertDialogTrigger = vi.fn(({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button {...props}>{children}</button>
));

export const AlertDialogContent = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div role="alertdialog" {...props}>{children}</div>
));

export const AlertDialogHeader = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div {...props}>{children}</div>
));

export const AlertDialogTitle = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { children: React.ReactNode }) => (
  <h2 {...props}>{children}</h2>
));

export const AlertDialogDescription = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { children: React.ReactNode }) => (
  <p {...props}>{children}</p>
));

export const AlertDialogFooter = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div {...props}>{children}</div>
));

export const AlertDialogAction = vi.fn(({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button {...props}>{children}</button>
));

export const AlertDialogCancel = vi.fn(({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button {...props}>{children}</button>
));

export const DropdownMenu = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div {...props}>{children}</div>
));

export const DropdownMenuTrigger = vi.fn(({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button {...props}>{children}</button>
));

export const DropdownMenuContent = vi.fn(({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div {...props}>{children}</div>
));

export const DropdownMenuItem = vi.fn(({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button {...props}>{children}</button>
));

export const DropdownMenuSeparator = vi.fn(({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
  <hr {...props} />
));

export const Textarea = vi.fn(({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} />
)); 