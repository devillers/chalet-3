import * as React from 'react';

import { cn } from '@/lib/utils';

type TableElement = React.ElementRef<'table'>;
type TableProps = React.ComponentPropsWithoutRef<'table'>;

const Table = React.forwardRef<TableElement, TableProps>(
  (
    { className, ...props }: TableProps,
    ref: React.ForwardedRef<TableElement>
  ) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

type TableHeaderElement = React.ElementRef<'thead'>;
type TableHeaderProps = React.ComponentPropsWithoutRef<'thead'>;

const TableHeader = React.forwardRef<TableHeaderElement, TableHeaderProps>(
  (
    { className, ...props }: TableHeaderProps,
    ref: React.ForwardedRef<TableHeaderElement>
  ) => (
    <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
  )
);
TableHeader.displayName = 'TableHeader';

type TableBodyElement = React.ElementRef<'tbody'>;
type TableBodyProps = React.ComponentPropsWithoutRef<'tbody'>;

const TableBody = React.forwardRef<TableBodyElement, TableBodyProps>(
  (
    { className, ...props }: TableBodyProps,
    ref: React.ForwardedRef<TableBodyElement>
  ) => (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
);
TableBody.displayName = 'TableBody';

type TableFooterElement = React.ElementRef<'tfoot'>;
type TableFooterProps = React.ComponentPropsWithoutRef<'tfoot'>;

const TableFooter = React.forwardRef<TableFooterElement, TableFooterProps>(
  (
    { className, ...props }: TableFooterProps,
    ref: React.ForwardedRef<TableFooterElement>
  ) => (
    <tfoot
      ref={ref}
      className={cn(
        'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  )
);
TableFooter.displayName = 'TableFooter';

type TableRowElement = React.ElementRef<'tr'>;
type TableRowProps = React.ComponentPropsWithoutRef<'tr'>;

const TableRow = React.forwardRef<TableRowElement, TableRowProps>(
  (
    { className, ...props }: TableRowProps,
    ref: React.ForwardedRef<TableRowElement>
  ) => (
    <tr
      ref={ref}
      className={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

type TableHeadElement = React.ElementRef<'th'>;
type TableHeadProps = React.ComponentPropsWithoutRef<'th'>;

const TableHead = React.forwardRef<TableHeadElement, TableHeadProps>(
  (
    { className, ...props }: TableHeadProps,
    ref: React.ForwardedRef<TableHeadElement>
  ) => (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

type TableCellElement = React.ElementRef<'td'>;
type TableCellProps = React.ComponentPropsWithoutRef<'td'>;

const TableCell = React.forwardRef<TableCellElement, TableCellProps>(
  (
    { className, ...props }: TableCellProps,
    ref: React.ForwardedRef<TableCellElement>
  ) => (
    <td
      ref={ref}
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';

type TableCaptionElement = React.ElementRef<'caption'>;
type TableCaptionProps = React.ComponentPropsWithoutRef<'caption'>;

const TableCaption = React.forwardRef<TableCaptionElement, TableCaptionProps>(
  (
    { className, ...props }: TableCaptionProps,
    ref: React.ForwardedRef<TableCaptionElement>
  ) => (
    <caption
      ref={ref}
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
