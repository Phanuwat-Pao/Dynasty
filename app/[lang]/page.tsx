import { UserButton } from "@clerk/nextjs";
import { getDictionary } from "../../get-dictionary";
import { Locale } from "../../i18n-config";
import LocaleSwitcher from "./components/locale-switcher";

export default async function Home(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        {dictionary.title}
        <div className="flex flex-row gap-4">
          <UserButton />
          <LocaleSwitcher />
        </div>
      </header>
      <main className="p-8 flex flex-col gap-8"></main>
    </>
  );
}
