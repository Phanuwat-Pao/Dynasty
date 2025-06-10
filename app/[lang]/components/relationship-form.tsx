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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { cn, getFullName } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export default function RelationshipForm({
  dictionary,
  relationshipTypes,
  locale,
  relationshipId,
  peoplePreloaded,
}: {
  dictionary: Dictionary["relationship"];
  relationshipTypes: Dictionary["relationshipTypes"];
  locale: Locale;
  relationshipId?: Id<"relationships">;
  peoplePreloaded: Preloaded<typeof api.people.listPeople>;
}) {
  const addRelationshipFormSchema = z.object({
    person1Id: z.string().min(1),
    person2Id: z.string().min(1),
    relationshipType: z.union([z.literal("child"), z.literal("partner")]),
  });
  const people = usePreloadedQuery(peoplePreloaded) || [];
  const addRelationship = useMutation(api.relationships.addRelationship);
  const updateRelationship = useMutation(api.relationships.updateRelationship);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof addRelationshipFormSchema>>({
    resolver: zodResolver(addRelationshipFormSchema),
  });

  async function onSubmit(data: z.infer<typeof addRelationshipFormSchema>) {
    console.log(data);
    if (
      !data.person1Id ||
      !data.person2Id ||
      !data.relationshipType.trim() ||
      isSubmitting
    )
      return;
    if (data.person1Id === data.person2Id) {
      setError(dictionary.samePerson);
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      if (relationshipId) {
        await updateRelationship({
          relationshipId: relationshipId as Id<"relationships">,
          relationshipType: data.relationshipType,
        });
      } else {
        await addRelationship({
          person1Id: data.person1Id as Id<"people">,
          person2Id: data.person2Id as Id<"people">,
          relationshipType: data.relationshipType,
        });
      }
      form.reset();
    } catch (e: unknown) {
      console.error("Failed to add relationship:", e);
      setError(
        e instanceof Error ? e.message : dictionary.failedToAddRelationship,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const availablePeopleForPerson2 = people.filter(
    (p) => p._id !== form.getValues("person1Id"),
  );
  const availablePeopleForPerson1 = people.filter(
    (p) => p._id !== form.getValues("person2Id"),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {relationshipId
            ? dictionary.editRelationship
            : dictionary.addRelationship}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {relationshipId
              ? dictionary.editRelationship
              : dictionary.addRelationship}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
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
                            ? getFullName(
                                locale,
                                availablePeopleForPerson1.find(
                                  (person) => person._id === field.value,
                                )!,
                              )
                            : dictionary.selectPerson1}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder={dictionary.searchPerson1} />
                        <CommandList>
                          <CommandEmpty>
                            {dictionary.noPersonFound}
                          </CommandEmpty>
                          <CommandGroup>
                            {availablePeopleForPerson1.map((person) => (
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
                            ? getFullName(
                                locale,
                                availablePeopleForPerson2.find(
                                  (person) => person._id === field.value,
                                )!,
                              )
                            : dictionary.selectPerson2}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder={dictionary.searchPerson2} />
                        <CommandList>
                          <CommandEmpty>
                            {dictionary.noPersonFound}
                          </CommandEmpty>
                          <CommandGroup>
                            {availablePeopleForPerson2.map((person) => (
                              <CommandItem
                                value={person._id}
                                key={person._id}
                                onSelect={() => {
                                  form.setValue("person2Id", person._id);
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
            <FormField
              control={form.control}
              name="relationshipType"
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
                              (relationshipType) => (
                                <CommandItem
                                  value={relationshipType}
                                  key={relationshipType}
                                  onSelect={() => {
                                    form.setValue(
                                      "relationshipType",
                                      relationshipType as keyof typeof relationshipTypes,
                                    );
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
            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !form.watch("person1Id") ||
                  !form.watch("person2Id") ||
                  !form.watch("relationshipType")
                }
              >
                {isSubmitting ? dictionary.adding : dictionary.addRelationship}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
