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
  Form,
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
import { Id } from "@/convex/_generated/dataModel";
import { Dictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Authenticated, useMutation, useQuery } from "convex/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export default function AddRelationshipForm({
  dictionary,
  relationshipTypes,
  locale,
}: {
  dictionary: Dictionary["addRelationshipForm"];
  relationshipTypes: Dictionary["relationshipTypes"];
  locale: Locale;
}) {
  const addRelationshipFormSchema = z.object({
    person1Id: z.string().min(1),
    person2Id: z.string().min(1),
    type: z.enum(
      Object.getOwnPropertyNames(relationshipTypes) as [string, ...string[]],
    ),
  });
  const people = useQuery(api.people.listPeople) || [];
  const addRelationship = useMutation(api.relationships.addRelationship);
  const [person1Id, setPerson1Id] = useState<Id<"people"> | "">("");
  const [person2Id, setPerson2Id] = useState<Id<"people"> | "">("");
  const [type, setType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof addRelationshipFormSchema>>({
    resolver: zodResolver(addRelationshipFormSchema),
    defaultValues: {
      person1Id: "",
      person2Id: "",
      type: "",
    },
  });

  async function onSubmit(data: z.infer<typeof addRelationshipFormSchema>) {
    console.log(data);
    if (!person1Id || !person2Id || !type.trim() || isSubmitting) return;
    if (person1Id === person2Id) {
      setError(dictionary.samePerson);
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await addRelationship({ person1Id, person2Id, type });
      setPerson1Id("");
      setPerson2Id("");
      setType("");
    } catch (e: unknown) {
      console.error("Failed to add relationship:", e);
      setError(
        e instanceof Error ? e.message : dictionary.failedToAddRelationship,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const availablePeopleForPerson2 = people.filter((p) => p._id !== person1Id);
  const availablePeopleForPerson1 = people.filter((p) => p._id !== person2Id);

  return (
    <Authenticated>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">
            {dictionary.addRelationship}
          </h3>
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          <FormField
            control={form.control}
            name="person1Id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{dictionary.person1}</FormLabel>
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
                          ? availablePeopleForPerson1.find(
                              (person) => person._id === field.value,
                            )?.[locale === "th" ? "nameTh" : "nameEn"]
                          : dictionary.selectPerson1}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder={dictionary.searchPerson1} />
                      <CommandList>
                        <CommandEmpty>{dictionary.noPersonFound}</CommandEmpty>
                        <CommandGroup>
                          {availablePeopleForPerson1.map((person) => (
                            <CommandItem
                              value={person._id}
                              key={person._id}
                              onSelect={() => {
                                form.setValue("person1Id", person._id);
                              }}
                            >
                              {person[locale === "th" ? "nameTh" : "nameEn"]}
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
          <FormField
            control={form.control}
            name="person2Id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{dictionary.person2}</FormLabel>
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
                          ? availablePeopleForPerson2.find(
                              (person) => person._id === field.value,
                            )?.[locale === "th" ? "nameTh" : "nameEn"]
                          : dictionary.selectPerson2}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder={dictionary.searchPerson2} />
                      <CommandList>
                        <CommandEmpty>{dictionary.noPersonFound}</CommandEmpty>
                        <CommandGroup>
                          {availablePeopleForPerson2.map((person) => (
                            <CommandItem
                              value={person._id}
                              key={person._id}
                              onSelect={() => {
                                form.setValue("person2Id", person._id);
                              }}
                            >
                              {person[locale === "th" ? "nameTh" : "nameEn"]}
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
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{dictionary.relationshipType}</FormLabel>
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
                            (type) => (
                              <CommandItem
                                value={type}
                                key={type}
                                onSelect={() => {
                                  form.setValue("type", type);
                                }}
                              >
                                {
                                  relationshipTypes[
                                    type as keyof typeof relationshipTypes
                                  ]
                                }
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    type === field.value
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
          <Button
            type="submit"
            disabled={isSubmitting || !person1Id || !person2Id || !type}
          >
            {isSubmitting ? dictionary.adding : dictionary.addRelationship}
          </Button>
        </form>
      </Form>
    </Authenticated>
  );
}
