"use client";
import { Dictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { Authenticated } from "convex/react";
import { PersonTable } from "./people-table";
import { RelationshipTable } from "./relationship-table";

export default function AuthenticatedSection({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <Authenticated>
      <div className="flex flex-col md:flex-row gap-4">
        <PersonTable
          dictionary={dictionary.person}
        />
        <RelationshipTable
          dictionary={dictionary.relationship}
          relationshipTypes={dictionary.relationshipTypes}
          locale={locale}
        />
      </div>
    </Authenticated>
  );
}
