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
import { Locale } from "@/i18n-config";
import { getFullName } from "@/lib/utils";
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import Paginator from "./paginator";
import RelationshipForm from "./relationship-form";

export function RelationshipTable({
  locale,
  dictionary,
  relationshipTypes,
  preloadedRelationships,
  preloadedPeople,
}: {
  locale: Locale;
  dictionary: Dictionary["relationship"];
  relationshipTypes: Dictionary["relationshipTypes"];
  preloadedRelationships: Preloaded<typeof api.relationships.listRelationships>;
  preloadedPeople: Preloaded<typeof api.people.listPeople>;
}) {
  const relationships = usePreloadedQuery(preloadedRelationships) || [];
  const people = usePreloadedQuery(preloadedPeople) || [];
  const [pagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const deleteRelationship = useMutation(api.relationships.deleteRelationship);
  type Relationship = (typeof relationships)[number];

  const columnHelper = createColumnHelper<Relationship>();
  const person1Name: ColumnDef<Relationship> = {
    accessorKey: "person1Name",
    header: dictionary.person1,
    cell: ({ row }) => {
      const person = people.find((p) => p._id === row.original.person1Id);
      return (
        <div className="capitalize">
          {person ? getFullName(locale, person) : ""}
        </div>
      );
    },
  };
  const person2Name: ColumnDef<Relationship> = {
    accessorKey: "person2Name",

    header: dictionary.person2,
    cell: ({ row }) => {
      const person = people.find((p) => p._id === row.original.person2Id);
      return (
        <div className="capitalize">
          {person ? getFullName(locale, person) : ""}
        </div>
      );
    },
  };
  const relationshipType: ColumnDef<Relationship> = {
    accessorKey: "relationshipType",
    header: dictionary.relationshipType,
    cell: ({ row }) => (
      <div className="capitalize">
        {
          relationshipTypes[
            row.original.relationshipType as keyof typeof relationshipTypes
          ]
        }
      </div>
    ),
  };
  const actions: ColumnDef<Relationship> = columnHelper.display({
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <RelationshipForm
            dictionary={dictionary}
            relationshipTypes={relationshipTypes}
            locale={locale}
            relationshipId={row.original._id}
            preloadedPeople={preloadedPeople}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              deleteRelationship({ relationshipId: row.original._id });
            }}
          >
            <Trash2 />
          </Button>
        </div>
      );
    },
  });

  const is: ColumnDef<Relationship> = columnHelper.display({
    id: "is",
    enableHiding: false,
    cell: () => {
      return <div>{dictionary.is}</div>;
    },
  });

  let columns: ColumnDef<Relationship>[];
  if (locale === "th") {
    columns = [person1Name, is, relationshipType, person2Name, actions];
  } else {
    columns = [person1Name, is, person2Name, relationshipType, actions];
  }

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable<Relationship>({
    data: relationships,
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
      <RelationshipForm
        dictionary={dictionary}
        relationshipTypes={relationshipTypes}
        locale={locale}
        preloadedPeople={preloadedPeople}
      />
      <div className="flex items-center py-4">
        <Input
          placeholder={dictionary.filterRelationship}
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
                    <TableHead key={header.id}>
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
