"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePathname, useRouter } from "next/navigation";
import { type Locale } from "../../../i18n-config";

export default function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const redirectedPathname = (locale: Locale) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/"));
  };

  return (
    <ToggleGroup
      type="single"
      value={locale}
      onValueChange={redirectedPathname}
    >
      <ToggleGroupItem value="th" aria-label="Toggle bold">
        TH
      </ToggleGroupItem>
      <ToggleGroupItem value="en" aria-label="Toggle underline">
        EN
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
