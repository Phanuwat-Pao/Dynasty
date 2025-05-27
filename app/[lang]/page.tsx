import { UserButton } from "@clerk/nextjs";
import { getDictionary } from "../../get-dictionary";
import { Locale } from "../../i18n-config";
import AddPersonForm from "./components/add-person-form";
import AddRelationshipForm from "./components/add-relationship-form";
import { DarkModeToggle } from "./components/dark-mode-toggle";
import LocaleSwitcher from "./components/locale-switcher";
import { PersonTable } from "./components/person-table";
import SignInButton from "./components/sign-in-button";
export default async function Home(props: {
  params: Promise<{ lang: Locale }>;
}) {
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
      <main className="p-8 flex flex-col gap-8">
        <div className="flex flex-row gap-4">
          <AddPersonForm dictionary={dictionary.addPersonForm} />
          <AddRelationshipForm
            dictionary={dictionary.addRelationshipForm}
            relationshipTypes={dictionary.relationshipTypes}
            locale={lang}
          />
        </div>
        <PersonTable />
      </main>
    </>
  );
}
