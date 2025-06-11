import { api } from "@/convex/_generated/api";
import { Dictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { Authenticated, Preloaded } from "convex/react";
import { PersonTable } from "./people-table";
import { RelationshipTable } from "./relationship-table";

export default function Tables({
  locale,
  preloadedPeople,
  preloadedRelationships,
  dictionary,
}: {
  locale: Locale;
  dictionary: Dictionary;
  preloadedPeople: Preloaded<typeof api.people.listPeople>;
  preloadedRelationships: Preloaded<typeof api.relationships.listRelationships>;
}) {
  return (
    <Authenticated>
      <div className="flex flex-col md:flex-row gap-4">
        <PersonTable
          dictionary={dictionary.person}
          preloadedPeople={preloadedPeople}
        />
        <RelationshipTable
          dictionary={dictionary.relationship}
          relationshipTypes={dictionary.relationshipTypes}
          locale={locale}
          preloadedRelationships={preloadedRelationships}
          preloadedPeople={preloadedPeople}
        />
      </div>
    </Authenticated>
  );
}
