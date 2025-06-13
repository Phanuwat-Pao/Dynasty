"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Trash2 } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { Dictionary } from "@/get-dictionary";
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import Paginator from "./paginator";
import PersonForm from "./person-form";

export function PersonTable({
  dictionary,
  preloadedPeople,
}: {
  dictionary: Dictionary["person"];
  preloadedPeople: Preloaded<typeof api.people.listPeople>;
}) {
  const people = usePreloadedQuery(preloadedPeople) || [];
  const deletePerson = useMutation(api.people.deletePerson);
  const [pagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  type Person = (typeof people)[number];
  const columnHelper = createColumnHelper<Person>();
  const columns: ColumnDef<Person>[] = [
    columnHelper.display({
      id: "portraitImage",
      header: dictionary.portraitImage,
      cell: ({ row }) => (
        <Avatar>
          <AvatarImage
            src={row.original?.portraitUrl ?? undefined}
            alt="@shadcn"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
    }),
    columnHelper.group({
      header: dictionary.thai,
      columns: [
        {
          accessorKey: "nicknameTh",
          header: dictionary.nickname,
          cell: ({ row }) => (
            <div className="capitalize">{row.original.nicknameTh}</div>
          ),
        },

        {
          accessorKey: "prenameTh",
          header: dictionary.prename,
          cell: ({ row }) => (
            <div className="capitalize">{row.original.prenameTh}</div>
          ),
        },
        {
          accessorKey: "givenNameTh",
          header: dictionary.givenName,
          cell: ({ row }) => (
            <div className="capitalize">{row.original.givenNameTh}</div>
          ),
        },
        {
          accessorKey: "familyNameTh",
          header: dictionary.familyName,
          cell: ({ row }) => (
            <div className="capitalize">{row.original.familyNameTh}</div>
          ),
        },
      ],
    }),
    columnHelper.group({
      header: dictionary.english,
      columns: [
        {
          accessorKey: "nicknameEn",
          header: dictionary.nickname,
          cell: ({ row }) => (
            <div className="capitalize">{row.original.nicknameEn}</div>
          ),
        },
        {
          accessorKey: "prenameEn",
          header: dictionary.prename,
          cell: ({ row }) => (
            <div className="capitalize">{row.original.prenameEn}</div>
          ),
        },

        {
          accessorKey: "givenNameEn",
          header: dictionary.givenName,
          cell: ({ row }) => (
            <div className="capitalize">{row.original.givenNameEn}</div>
          ),
        },

        {
          accessorKey: "familyNameEn",
          header: dictionary.familyName,
          cell: ({ row }) => (
            <div className="capitalize">{row.original.familyNameEn}</div>
          ),
        },
      ],
    }),
    columnHelper.display({
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <PersonForm
              dictionary={dictionary}
              personId={row.original._id}
              people={people}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                deletePerson({ personId: row.original._id });
              }}
            >
              <Trash2 />
            </Button>
          </div>
        );
      },
    }),
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable<Person>({
    data: people,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div className="w-full px-4">
      <PersonForm dictionary={dictionary} />
      <div className="flex items-center py-4">
        <Input
          placeholder={dictionary.filterPerson}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Paginator
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          onPageChange={(pageNumber) => table.setPageIndex(pageNumber - 1)}
          showPreviousNext
        />
      </div>
    </div>
  );
}
