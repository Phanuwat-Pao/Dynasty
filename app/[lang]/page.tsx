import { api } from "@/convex/_generated/api";
import { UserButton } from "@clerk/nextjs";
import { preloadQuery } from "convex/nextjs";
import { getDictionary } from "../../get-dictionary";
import { Locale } from "../../i18n-config";
import AuthenticatedSection from "./components/authenticated-section";
import { DarkModeToggle } from "./components/dark-mode-toggle";
import LocaleSwitcher from "./components/locale-switcher";
import NetworkVisualization from "./components/network-visualization";
import SignInButton from "./components/sign-in-button";

export default async function Home(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const preloadedPeople = await preloadQuery(api.people.listPeople);
  const preloadedRelationships = await preloadQuery(
    api.relationships.listRelationships,
  );

  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return (
    <>
      <header className="sticky top-0 z-10 bg-background px-4 py-2 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        {dictionary.title}
        <div className="flex flex-row gap-4">
          <SignInButton dictionary={dictionary.signIn} />
          <UserButton />
          <LocaleSwitcher locale={lang} />
          <DarkModeToggle />
        </div>
      </header>
      <main className="p-8 flex flex-col gap-8 h-full w-full">
        <AuthenticatedSection
          dictionary={dictionary}
          preloadedPeople={preloadedPeople}
          preloadedRelationships={preloadedRelationships}
          locale={lang}
        />
        <NetworkVisualization
          locale={lang}
          preloadedPeople={preloadedPeople}
          preloadedRelationships={preloadedRelationships}
          relationshipTypes={dictionary.relationshipTypes}
        />
      </main>
    </>
  );
}
