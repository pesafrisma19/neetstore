import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className="w-full overflow-x-auto border-[length:var(--nb-border-width)] border-[var(--nb-border)] rounded-[var(--nb-radius-card)]"
    style={{
      boxShadow: `var(--nb-shadow-x) var(--nb-shadow-y) var(--nb-shadow-blur) var(--nb-shadow-spread) var(--nb-shadow)`,
    }}
  >
    <table className={`w-full text-left border-collapse bg-[var(--nb-surface)] ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <thead className={`bg-[var(--nb-table-header-bg)] border-b-[length:var(--nb-border-width)] border-[var(--nb-border)] text-xs font-black uppercase ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <tbody className={`divide-y-[length:var(--nb-border-width-sm)] divide-[var(--nb-divider)] text-xs font-bold ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <tr className={`hover:bg-[var(--nb-table-row-hover)] transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <th className={`p-3.5 font-black uppercase text-[var(--nb-text)] ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <td className={`p-3.5 text-[var(--nb-text)] ${className}`} {...props}>
    {children}
  </td>
);
