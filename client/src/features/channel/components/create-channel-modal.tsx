"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModalFooter } from "@/components/ui/credenza-footer";

const RESERVED_NAMES = ["settings", "admin", "api", "general"];

export const createChannelSchema = z.object({
  name: z
    .string()
    .min(3, "Channel name must be at least 3 characters.")
    .max(32, "Channel name must be at most 32 characters.")
    // Step 1: Enforce the core regex matching (lowercase, numbers, hyphens)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only.")
    // Step 2: Ensure it doesn't start or end with a trailing hyphen
    .refine((val) => !val.startsWith("-") && !val.endsWith("-"), {
      message: "Channel name cannot start or end with a hyphen.",
    })
    // Step 3: Check against blacklisted internal routing names
    .refine((val) => !RESERVED_NAMES.includes(val), {
      message: "This channel name is reserved for system routing.",
    }),
});
type CreateChannelFormData = z.infer<typeof createChannelSchema>;

export default function CreateChannelModal() {
  const [open, setOpen] = React.useState(false);

  const form = useForm<CreateChannelFormData>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(data: CreateChannelFormData) {
    try {
      console.log("Submitting channel values:", data);
      // Your backend implementation logic goes here

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <Tooltip>
        <CredenzaTrigger asChild>
          <TooltipTrigger
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <Plus className="size-4 text-muted-foreground" />
          </TooltipTrigger>
        </CredenzaTrigger>
        <TooltipContent>
          <p>Create a channel</p>
        </TooltipContent>
      </Tooltip>

      <CredenzaContent className="sm:max-w-[425px]">
        <CredenzaHeader>
          <CredenzaTitle>Create a channel</CredenzaTitle>
          <CredenzaDescription>
            Channels are where your team communicates. They’re best when
            organized around a topic.
          </CredenzaDescription>
        </CredenzaHeader>

        <form id="create-channel-form" onSubmit={form.handleSubmit(onSubmit)}>
          <CredenzaBody className="pb-4">
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="channel-name-input">
                      Channel name
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="block-start">
                        <InputGroupText className="select-none font-medium opacity-70">
                          #
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        {...field}
                        id="channel-name-input"
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. plan-launch"
                        autoComplete="off"
                      />
                    </InputGroup>
                    <FieldDescription>
                      This will be the path name for your channel.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </CredenzaBody>
        </form>

        <CredenzaFooter>
          <ModalFooter
            formId="create-channel-form"
            submitLabel={"Create Channel"}
            cancelLabel="Cancel"
            // isLoading={isLoading}
            onCancel={() => setOpen(false)}
          />
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
