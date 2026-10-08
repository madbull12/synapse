"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import {
  useVerifyInvitation,
  useAcceptInvitation,
} from "@/hooks/use-invitation";

const acceptInviteFormSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters.",
      })
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol"),
    passwordConfirmation: z.string().min(8, {
      message: "Password confirmation must be at least 8 characters.",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] =
    useState(false);

  // React Query hooks for token verification and acceptance
  const {
    data: verifyResponse,
    isLoading: loadingInvite,
    error: verifyError,
  } = useVerifyInvitation(token);
  const {
    mutate: acceptInvite,
    isPending: actionLoading,
    error: actionError,
  } = useAcceptInvitation();

  const form = useForm<z.infer<typeof acceptInviteFormSchema>>({
    resolver: zodResolver(acceptInviteFormSchema),
    defaultValues: {
      name: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const inviteData = verifyResponse?.data;

  const handleAccept = (values?: z.infer<typeof acceptInviteFormSchema>) => {
    if (!token) return;

    acceptInvite(
      {
        token,
        name: values?.name || "",
        password: values?.password || "",
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
      },
    );
  };

  // 1. Loading State
  if (loadingInvite) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Verifying invitation...</span>
        </div>
      </main>
    );
  }

  // 2. Error / Invalid Token State
  if (verifyError || !inviteData) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm rounded-sm border p-6 text-center space-y-4 shadow-sm">
          <h1 className="font-bold text-xl text-destructive">
            Invalid Invitation
          </h1>
          <p className="text-muted-foreground text-sm">
            {verifyError?.message ||
              "This invitation link is invalid, expired, or has already been used."}
          </p>
        </div>
      </main>
    );
  }

  // 3. Valid Invitation State (Dynamic Branching)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-sm border p-6 space-y-6 shadow-sm bg-card">
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-2xl tracking-tight">Join Workspace</h1>
          <p className="text-muted-foreground text-sm">
            You&apos;ve been invited to join{" "}
            <strong className="text-foreground">
              {inviteData.workspaceName}
            </strong>{" "}
            as{" "}
            <span className="text-foreground font-medium">
              {inviteData.email}
            </span>
            .
          </p>
        </div>

        {/* Branch A: Existing User (Frictionless 1-click join) */}
        {inviteData.isExistingUser ? (
          <div className="space-y-4">
            <Button
              loading={actionLoading}
              className="w-full"
              onClick={() => handleAccept()}
            >
              Accept & Join Workspace
            </Button>
          </div>
        ) : (
          /* Branch B: New User (Customized Registration Form matching your design system) */
          <form
            id="accept-invite-form"
            className="space-y-4"
            onSubmit={form.handleSubmit((vals) => handleAccept(vals))}
          >
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input {...field} id="name" placeholder="John Doe" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="password"
                      type={passwordVisible ? "text" : "password"}
                      placeholder="Enter password"
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? (
                          <EyeIcon className="h-4 w-4" />
                        ) : (
                          <EyeOffIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="passwordConfirmation"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="passwordConfirmation">
                    Confirm Password
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="passwordConfirmation"
                      type={passwordConfirmationVisible ? "text" : "password"}
                      placeholder="Confirm password"
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() =>
                          setPasswordConfirmationVisible(
                            !passwordConfirmationVisible,
                          )
                        }
                      >
                        {passwordConfirmationVisible ? (
                          <EyeIcon className="h-4 w-4" />
                        ) : (
                          <EyeOffIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button
              loading={actionLoading}
              className="w-full"
              type="submit"
              form="accept-invite-form"
            >
              Complete Registration & Join
            </Button>
          </form>
        )}

        {/* Action Error Alert */}
        {actionError && (
          <div className="p-3 text-sm text-destructive bg-destructive/20 rounded-md border border-destructive">
            {actionError.response?.data?.message ||
              actionError.message ||
              "Action failed. Please try again."}
          </div>
        )}
      </div>
    </main>
  );
}
