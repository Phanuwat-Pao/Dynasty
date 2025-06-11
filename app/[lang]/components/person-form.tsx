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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Dictionary } from "@/get-dictionary";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { SquarePen } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const personFormSchema = z.object({
  nicknameTh: z.string().optional(),
  nicknameEn: z.string().optional(),
  prenameTh: z.string().optional(),
  prenameEn: z.string().optional(),
  givenNameTh: z.string().optional(),
  givenNameEn: z.string().optional(),
  familyNameTh: z.string().optional(),
  familyNameEn: z.string().optional(),
  portraitImage: z
    .instanceof(File)
    .optional()
    .refine((file) => !file?.size || file.size < 5000000, {
      message: "Your portrait image must be less than 5MB.",
    }),
});

export default function PersonForm({
  dictionary,
  personId,
  people,
}: {
  dictionary: Dictionary["person"];
  personId?: Id<"people">;
  people?: Doc<"people">[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createPerson = useMutation(api.people.createPerson);
  const updatePerson = useMutation(api.people.updatePerson);
  const generateUploadUrl = useMutation(api.people.generateUploadUrl);
  const [open, setOpen] = useState(false);
  // Make type file work in shadcn & react hook form: https://github.com/shadcn-ui/ui/discussions/2137
  const imageInput = useRef<HTMLInputElement>(null);

  const personForm = useForm<z.infer<typeof personFormSchema>>({
    resolver: zodResolver(personFormSchema),
    defaultValues: {
      nicknameTh: personId
        ? people?.find((p) => p._id === personId)?.nicknameTh
        : "",
      nicknameEn: personId
        ? people?.find((p) => p._id === personId)?.nicknameEn
        : "",
      prenameTh: personId
        ? people?.find((p) => p._id === personId)?.prenameTh
        : "",
      prenameEn: personId
        ? people?.find((p) => p._id === personId)?.prenameEn
        : "",
      givenNameTh: personId
        ? people?.find((p) => p._id === personId)?.givenNameTh
        : "",
      givenNameEn: personId
        ? people?.find((p) => p._id === personId)?.givenNameEn
        : "",
      familyNameTh: personId
        ? people?.find((p) => p._id === personId)?.familyNameTh
        : "",
      familyNameEn: personId
        ? people?.find((p) => p._id === personId)?.familyNameEn
        : "",
      portraitImage: undefined,
    },
  });

  async function onSubmit(data: z.infer<typeof personFormSchema>) {
    setIsSubmitting(true);

    let portraitImageId: Id<"_storage"> | undefined = undefined;
    if (data.portraitImage) {
      try {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": data.portraitImage.type },
          body: data.portraitImage,
        });
        const json = await result.json();
        if (!result.ok) {
          throw new Error(`Upload failed: ${JSON.stringify(json)}`);
        }
        portraitImageId = json.storageId;
      } catch (error) {
        toast.error("Image upload error:", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
        console.error("Image upload error:", error);
        // Consider showing an error toast to the user
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (personId) {
        await updatePerson({
          personId: personId,
          nicknameTh: data.nicknameTh?.trim(),
          nicknameEn: data.nicknameEn?.trim(),
          prenameTh: data.prenameTh?.trim(),
          prenameEn: data.prenameEn?.trim(),
          givenNameTh: data.givenNameTh?.trim(),
          givenNameEn: data.givenNameEn?.trim(),
          familyNameTh: data.familyNameTh?.trim(),
          familyNameEn: data.familyNameEn?.trim(),
          portraitImageId,
        });
      } else {
        await createPerson({
          nicknameTh: data.nicknameTh?.trim(),
          nicknameEn: data.nicknameEn?.trim(),
          prenameTh: data.prenameTh?.trim(),
          prenameEn: data.prenameEn?.trim(),
          givenNameTh: data.givenNameTh?.trim(),
          givenNameEn: data.givenNameEn?.trim(),
          familyNameTh: data.familyNameTh?.trim(),
          familyNameEn: data.familyNameEn?.trim(),
          portraitImageId,
        });
      }
      personForm.reset();
      // Make type file work in shadcn & react hook form: https://github.com/shadcn-ui/ui/discussions/2137
      if (imageInput.current) {
        imageInput.current.value = "";
      }
    } catch (error) {
      console.error("Failed to create person:", error);
      // Consider showing an error toast
    } finally {
      setIsSubmitting(false);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {personId ? <SquarePen /> : dictionary.addPerson}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {personId ? dictionary.editPerson : dictionary.addPerson}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <Form {...personForm}>
          <form
            onSubmit={personForm.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <Separator />
            <h1>{dictionary.thai}</h1>
            <FormField
              control={personForm.control}
              name="nicknameTh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.nickname}</FormLabel>
                  <FormControl>
                    <Input placeholder={dictionary.personName} {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={personForm.control}
              name="prenameTh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.prename}</FormLabel>
                  <FormControl>
                    <Input placeholder={dictionary.personName} {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={personForm.control}
              name="givenNameTh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.givenName}</FormLabel>
                  <FormControl>
                    <Input placeholder={dictionary.personName} {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={personForm.control}
              name="familyNameTh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.familyName}</FormLabel>
                  <FormControl>
                    <Input placeholder={dictionary.personName} {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <h1>{dictionary.english}</h1>
            <FormField
              control={personForm.control}
              name="nicknameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.nickname}</FormLabel>
                  <FormControl>
                    <Input placeholder={dictionary.personName} {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={personForm.control}
              name="prenameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.prename}</FormLabel>
                  <FormControl>
                    <Input placeholder={dictionary.personName} {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={personForm.control}
              name="givenNameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.givenName}</FormLabel>
                  <FormControl>
                    <Input placeholder={dictionary.personName} {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={personForm.control}
              name="familyNameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.familyName}</FormLabel>
                  <FormControl>
                    <Input placeholder={dictionary.personName} {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <FormField
              control={personForm.control}
              name="portraitImage"
              // Make type file work in shadcn & react hook form: https://github.com/shadcn-ui/ui/discussions/2137
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>{dictionary.portraitImage}</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept="image/*"
                      ref={imageInput}
                      onChange={(event) =>
                        onChange(event.target.files && event.target.files[0])
                      }
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? dictionary.adding : dictionary.addPerson}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
