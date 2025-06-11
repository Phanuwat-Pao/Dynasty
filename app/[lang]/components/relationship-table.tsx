"use client";

import {
  ColumnDef,
  ColumnFiltersState,
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
import {
  Authenticated,
  Preloaded,
  useMutation,
  usePreloadedQuery,
} from "convex/react";
import RelationshipForm from "./relationship-form";

export function RelationshipTable({
  locale,
  dictionary,
  relationshipTypes,
  relationshipsPreloaded,
  peoplePreloaded,
}: {
  locale: Locale;
  dictionary: Dictionary["relationship"];
  relationshipTypes: Dictionary["relationshipTypes"];
  relationshipsPreloaded: Preloaded<typeof api.relationships.listRelationships>;
  peoplePreloaded: Preloaded<typeof api.people.listPeople>;
}) {
  const relationships = usePreloadedQuery(relationshipsPreloaded) || [];
  const people = usePreloadedQuery(peoplePreloaded) || [];
  const deleteRelationship = useMutation(api.relationships.deleteRelationship);
  type Relationship = (typeof relationships)[number];

  const columnHelper = createColumnHelper<Relationship>();
  const columns: ColumnDef<Relationship>[] = [
    {
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
    },
    {
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
    },
    {
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
    },
    columnHelper.display({
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
              peoplePreloaded={peoplePreloaded}
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
    }),
  ];

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
    },
  });

  return (
    <Authenticated>
      <div className="w-full px-4">
        <RelationshipForm
          dictionary={dictionary}
          relationshipTypes={relationshipTypes}
          locale={locale}
          peoplePreloaded={peoplePreloaded}
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
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Authenticated>
  );
}
