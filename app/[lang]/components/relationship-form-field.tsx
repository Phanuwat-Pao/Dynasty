"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";
import { Dictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { addRelationshipFormSchema, cn, getFullName } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import z from "zod";


export default function RelationshipFormField({
  form,
  dictionary,
  locale,
  relationshipTypes,
}: {
  form: UseFormReturn<z.infer<typeof addRelationshipFormSchema>>;
  dictionary: {
    relationshipType: string;
    selectRelationshipType: string;
    searchRelationshipType: string;
    noRelationshipTypeFound: string;
  };
  locale: Locale;
  relationshipTypes: Dictionary["relationshipTypes"];
}) {
  const [open, setOpen] = useState(false);
  return (
<FormField
              control={form.control}
              name="relationshipType"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{dictionary.relationshipType}</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[200px] justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? relationshipTypes[
                                field.value as keyof typeof relationshipTypes
                              ]
                            : dictionary.selectRelationshipType}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput
                          placeholder={dictionary.searchRelationshipType}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {dictionary.noRelationshipTypeFound}
                          </CommandEmpty>
                          <CommandGroup>
                            {Object.getOwnPropertyNames(relationshipTypes).map(
                              (relationshipType) => (
                                <CommandItem
                                  value={relationshipType}
                                  key={relationshipType}
                                  onSelect={() => {
                                    form.setValue(
                                      "relationshipType",
                                      relationshipType as keyof typeof relationshipTypes,
                                    );
                                    setOpen(false);
                                  }}
                                >
                                  {
                                    relationshipTypes[
                                      relationshipType as keyof typeof relationshipTypes
                                    ]
                                  }
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      relationshipType === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              ),
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
  );
}
