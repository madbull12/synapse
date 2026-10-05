// features/workspace/components/invite-member-modal.tsx
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams } from "next/navigation";
import { UserPlus } from "lucide-react";

import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ModalFooter } from "@/components/ui/credenza-footer";
import { useSendWorkspaceInvitation } from "../hooks/mutations/use-workspace";

const inviteSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address."),
  role: z.enum(["member", "admin"]).default("member"),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export default function InviteMemberModal({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const params = useParams();
  const workspaceId = (params?.workspaceId as string) || "";

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema) as any,
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const { mutate: sendInvitation, isPending } =
    useSendWorkspaceInvitation(workspaceId);

  function onSubmit(data: InviteFormData) {
    if (!workspaceId) return;

    sendInvitation(
      {
        email: data.email,
        role: data.role,
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
      <CredenzaTrigger asChild>
        {/* If children are passed, use them. Otherwise fallback to your default icon/button */}
        {children ? (
          children
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button>
                <UserPlus className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Invite Member</TooltipContent>
          </Tooltip>
        )}
      </CredenzaTrigger>

      <CredenzaContent className="md:max-w-106.25">
        <CredenzaHeader>
          <CredenzaTitle>Invite member to workspace</CredenzaTitle>
          <CredenzaDescription>
            Send an invitation link to collaborate in this shared ecosystem.
          </CredenzaDescription>
        </CredenzaHeader>

        <form id="invite-member-form" onSubmit={form.handleSubmit(onSubmit)}>
          <CredenzaBody className="pb-4">
            <FieldGroup className="gap-4">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="invite-email">
                      Email address
                    </FieldLabel>
                    <Input
                      {...field}
                      id="invite-email"
                      type="email"
                      disabled={isPending}
                      placeholder="colleague@example.com"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="invite-role">
                      Workspace role
                    </FieldLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger
                        id="invite-role"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent
                        onPointerDownOutside={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Admins can manage channels, settings, and workspace
                      configurations.
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

        <ModalFooter
          formId="invite-member-form"
          submitLabel={isPending ? "Sending..." : "Send Invitation"}
          cancelLabel="Cancel"
          isLoading={isPending}
          onCancel={() => setOpen(false)}
        />
      </CredenzaContent>
    </Credenza>
  );
}
