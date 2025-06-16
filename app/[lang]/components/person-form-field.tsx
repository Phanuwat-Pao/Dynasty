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
import { cn, getFullName } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import z from "zod";

export const addRelationshipFormSchema = z.object({
  person1Id: z.string().min(1),
  person2Id: z.string().min(1),
  relationshipType: z.union([z.literal("father"), z.literal("mother")]),
  number: z.number({ coerce: true }).min(1),
});

export default function PersonFormField({
  form,
  dictionary,
  locale,
  availablePeopleForPerson,
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
}) {
  return (
    <FormField
      control={form.control}
      name="person1Id"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{dictionary.person}</FormLabel>
          <Popover>
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
                          form.setValue("person1Id", person._id);
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
