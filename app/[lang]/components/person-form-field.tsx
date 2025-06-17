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
import { Locale } from "@/i18n-config";
import { addRelationshipFormSchema, cn, getFullName, relationshipTypesZod } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import z from "zod";



export default function PersonFormField({
  form,
  dictionary,
  locale,
  availablePeopleForPerson,
  name,
}: {
  form: UseFormReturn<z.infer<typeof addRelationshipFormSchema>>;
  dictionary: {
    person: string;
    selectPerson: string;
    searchPerson: string;
    noPersonFound: string;
  };
  locale: Locale;
  availablePeopleForPerson: (typeof api.people.listPeople)["_returnType"];
  name: "person1Id" | "person2Id";
}) {
  const [open, setOpen] = useState(false);
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{dictionary.person}</FormLabel>
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
                    ? getFullName(
                        locale,
                        availablePeopleForPerson.find(
                          (person) => person._id === field.value,
                        )!,
                      )
                    : dictionary.selectPerson}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder={dictionary.searchPerson} />
                <CommandList>
                  <CommandEmpty>{dictionary.noPersonFound}</CommandEmpty>
                  <CommandGroup>
                    {availablePeopleForPerson.map((person) => (
                      <CommandItem
                        value={person._id}
                        key={person._id}
                        onSelect={() => {
                          form.setValue(name, person._id);
                          setOpen(false);
                        }}
                      >
                        {getFullName(locale, person)}
                        <Check
                          className={cn(
                            "ml-auto",
                            person._id === field.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    ))}
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
