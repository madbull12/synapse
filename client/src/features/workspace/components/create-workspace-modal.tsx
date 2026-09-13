"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ModalFooter } from "@/components/ui/credenza-footer";
import { useCreateWorkspace } from "../hooks/mutations/use-workspace";

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, "Workspace name must be at least 3 characters.")
    .max(32, "Workspace name must be at most 32 characters.")
    .refine(
      (val) => val.trim().length > 0,
      "Workspace name cannot be empty or just spaces.",
    ),
});

type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

export default function CreateWorkspaceModal() {
  const [open, setOpen] = React.useState(false);

  const form = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate: createWorkspace, isPending } = useCreateWorkspace();

  function onSubmit(data: CreateWorkspaceFormData) {
    createWorkspace(
      {
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        logoURL: "", // Placeholder for logo URL, can be updated later
      },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      },
    );
  }

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      {/* Trigger Button with Tooltip Integration */}
      <Tooltip delayDuration={200}>
        <CredenzaTrigger asChild>
          <TooltipTrigger className="flex size-11 items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground hover:rounded-xl hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer">
            <Plus className="size-5" />
          </TooltipTrigger>
        </CredenzaTrigger>
        <TooltipContent side="right" sideOffset={12}>
          <p className="text-xs">Add a workspace</p>
        </TooltipContent>
      </Tooltip>

      <CredenzaContent className="sm:max-w-[425px]">
        <CredenzaHeader>
          <CredenzaTitle>Create a workspace</CredenzaTitle>
          <CredenzaDescription>
            Workspaces securely isolate channels, files, direct messages, and
            members.
          </CredenzaDescription>
        </CredenzaHeader>

        {/* Form Body Context */}
        <form id="create-workspace-form" onSubmit={form.handleSubmit(onSubmit)}>
          <CredenzaBody className="pb-4">
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="workspace-name">
                      Workspace name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="workspace-name"
                      disabled={isPending}
                      placeholder="e.g. Acme Corp, Side Hustle"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      This is the display name of your shared ecosystem.
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

        {/* Unified Footer Actions Controls */}
        <ModalFooter
          formId="create-workspace-form"
          submitLabel={isPending ? "Creating..." : "Create Workspace"}
          cancelLabel="Cancel"
          isLoading={isPending}
          onCancel={() => setOpen(false)}
        />
      </CredenzaContent>
    </Credenza>
  );
}
