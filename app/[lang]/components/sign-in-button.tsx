"use client";

import { Button } from "@/components/ui/button";
import { Dictionary } from "@/get-dictionary";
import { SignInButton as ClerkSignInButton } from "@clerk/nextjs";
import { Unauthenticated } from "convex/react";

export default function SignInButton({
  dictionary,
}: {
  dictionary: Dictionary["signIn"];
}) {
  return (
    <Unauthenticated>
      <ClerkSignInButton mode="modal">
        <Button variant="outline">{dictionary}</Button>
      </ClerkSignInButton>
    </Unauthenticated>
  );
}
