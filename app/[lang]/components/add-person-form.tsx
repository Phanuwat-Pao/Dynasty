"use client";
import { Button } from "@/components/ui/button";
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
import { Id } from "@/convex/_generated/dataModel";
import { Dictionary } from "@/get-dictionary";
import { zodResolver } from "@hookform/resolvers/zod";
import { Authenticated, useMutation } from "convex/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const addPersonFormSchema = z.object({
  nameTh: z.string().min(1),
  nameEn: z.string().optional(),
  portraitImage: z.instanceof(File).refine((file) => file.size < 5000000, {
    message: "Your portrait image must be less than 5MB.",
  }),
});

export default function AddPersonForm({
  dictionary,
}: {
  dictionary: Dictionary["addPersonForm"];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createPerson = useMutation(api.people.createPerson);
  const generateUploadUrl = useMutation(api.people.generateUploadUrl);
  // Make type file work in shadcn & react hook form: https://github.com/shadcn-ui/ui/discussions/2137
  const imageInput = useRef<HTMLInputElement>(null);

  const addPersonForm = useForm<z.infer<typeof addPersonFormSchema>>({
    resolver: zodResolver(addPersonFormSchema),
    defaultValues: {
      nameTh: "",
      nameEn: "",
      portraitImage: undefined,
    },
  });

  async function onSubmit(data: z.infer<typeof addPersonFormSchema>) {
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
        console.error("Image upload error:", error);
        // Consider showing an error toast to the user
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await createPerson({
        nameTh: data.nameTh.trim(),
        nameEn: data.nameEn?.trim(),
        portraitImageId,
      });
      addPersonForm.reset();
      // Make type file work in shadcn & react hook form: https://github.com/shadcn-ui/ui/discussions/2137
      if (imageInput.current) {
        imageInput.current.value = "";
      }
    } catch (error) {
      console.error("Failed to create person:", error);
      // Consider showing an error toast
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Authenticated>
      <Form {...addPersonForm}>
        <form
          onSubmit={addPersonForm.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <h3 className="text-lg font-semibold mb-3 text-primary">
            {dictionary.addPerson}
          </h3>
          <FormField
            control={addPersonForm.control}
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
            control={addPersonForm.control}
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
            control={addPersonForm.control}
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
          <Button
            type="submit"
            disabled={isSubmitting || !addPersonForm.getValues("nameTh").trim()}
          >
            {isSubmitting ? dictionary.adding : dictionary.addPerson}
          </Button>
        </form>
      </Form>
    </Authenticated>
  );
}
