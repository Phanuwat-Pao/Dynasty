"use client";
import { Button } from "@/components/ui/button";
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
  Form
} from "@/components/ui/form";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Dictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { addRelationshipFormSchema } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { SquarePen } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import PersonFormField from "./person-form-field";
import RelationshipFormField from "./relationship-form-field";

export default function RelationshipForm({
  dictionary,
  relationshipTypes,
  locale,
  relationshipId,
  people,
}: {
  dictionary: Dictionary["relationship"];
  relationshipTypes: Dictionary["relationshipTypes"];
  locale: Locale;
  relationshipId?: Id<"relationships">;
  people: typeof api.people.listPeople["_returnType"];
}) {
  const addRelationship = useMutation(api.relationships.addRelationship);
  const updateRelationship = useMutation(api.relationships.updateRelationship);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof addRelationshipFormSchema>>({
    resolver: zodResolver(addRelationshipFormSchema),
    defaultValues: {
      number: 1,
    },
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

  const person2FormField = (
    <PersonFormField
      name="person2Id"
      form={form}
      dictionary={{
        person: dictionary.person2,
        selectPerson: dictionary.selectPerson2,
        searchPerson: dictionary.searchPerson2,
        noPersonFound: dictionary.noPersonFound,
      }}
      locale={locale}
      availablePeopleForPerson={availablePeopleForPerson2}
    />
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {relationshipId ? <SquarePen /> : dictionary.addRelationship}
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
            <PersonFormField
              name="person1Id"
              form={form}
              dictionary={{
                person: dictionary.person1,
                selectPerson: dictionary.selectPerson1,
                searchPerson: dictionary.searchPerson1,
                noPersonFound: dictionary.noPersonFound,
              }}
              locale={locale}
              availablePeopleForPerson={availablePeopleForPerson1}
            />
            <div>{dictionary.is}</div>
            {locale !== "th" && person2FormField}
            <RelationshipFormField
              form={form}
              dictionary={{
                relationshipType: dictionary.relationshipType,
                selectRelationshipType: dictionary.selectRelationshipType,
                searchRelationshipType: dictionary.searchRelationshipType,
                noRelationshipTypeFound: dictionary.noRelationshipTypeFound,
              }}
              relationshipTypes={relationshipTypes}
            />
            {locale === "th" && person2FormField}
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
