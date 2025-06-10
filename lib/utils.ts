import { Locale } from "@/i18n-config";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFullName<
  T extends {
    nicknameTh?: string;
    nicknameEn?: string;
    prenameTh?: string;
    prenameEn?: string;
    givenNameTh?: string;
    givenNameEn?: string;
    familyNameTh?: string;
    familyNameEn?: string;
  },
>(locale: Locale, person: T) {
  const nickname =
    locale === "th"
      ? person.nicknameTh
        ? person.nicknameTh
        : person.nicknameEn
      : person.nicknameEn
        ? person.nicknameEn
        : person.nicknameTh;
  const prename =
    locale === "th"
      ? person.prenameTh
        ? person.prenameTh
        : person.prenameEn
      : person.prenameEn
        ? person.prenameEn
        : person.prenameTh;
  const givenName =
    locale === "th"
      ? person.givenNameTh
        ? person.givenNameTh
        : person.givenNameEn
      : person.givenNameEn
        ? person.givenNameEn
        : person.givenNameTh;
  const familyName =
    locale === "th"
      ? person.familyNameTh
        ? person.familyNameTh
        : person.familyNameEn
      : person.familyNameEn
        ? person.familyNameEn
        : person.familyNameTh;

  return (
    `${nickname}` +
    (prename ? ` ${prename}` : "") +
    (givenName ? ` ${givenName}` : "") +
    (familyName ? ` ${familyName}` : "")
  );
}
