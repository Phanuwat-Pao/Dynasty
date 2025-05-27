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
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Dictionary } from "@/get-dictionary";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const personFormSchema = z.object({
  nameTh: z.string().min(1),
  nameEn: z.string().optional(),
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
      nameTh: personId ? people?.find((p) => p._id === personId)?.nameTh : "",
      nameEn: personId ? people?.find((p) => p._id === personId)?.nameEn : "",
      portraitImage: undefined,
    },
  });

  async function onSubmit(data: z.infer<typeof personFormSchema>) {
    console.log(data);
    if (!data.nameTh.trim() || isSubmitting) return;
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
          nameTh: data.nameTh.trim(),
          nameEn: data.nameEn?.trim(),
          portraitImageId,
        });
      } else {
        await createPerson({
          nameTh: data.nameTh.trim(),
          nameEn: data.nameEn?.trim(),
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
          {personId ? dictionary.editPerson : dictionary.addPerson}
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
            <FormField
              control={personForm.control}
              name="nameTh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.nameTh}</FormLabel>
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
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.nameEn}</FormLabel>
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
              <Button
                type="submit"
                disabled={isSubmitting || !personForm.watch("nameTh").trim()}
              >
                {isSubmitting ? dictionary.adding : dictionary.addPerson}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
