"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRegister } from "@/features/auth/hooks/mutations/use-auth";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Eye, EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
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
  });

const RegisterForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] =
    useState(false);

  const { mutate: register, isPending, isError, error } = useRegister();

  function onSubmit(values: z.infer<typeof formSchema>) {
    register(values);
  }
  return (
    <div className="w-full max-w-sm rounded-sm border p-4">
      <form
        id="register-form"
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-2xl">Create an account</h1>
          <p className="text-muted-foreground text-sm">
            Sign up to get started with our platform
          </p>
        </div>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input {...field} id="name" placeholder="John Doe" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                id="email"
                placeholder="you@example.com"
                type="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                  id="inline-end-input"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Enter password"
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <EyeIcon /> : <EyeOffIcon />}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                    {passwordConfirmationVisible ? <EyeIcon /> : <EyeOffIcon />}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          loading={isPending}
          className="w-full"
          type="submit"
          form="register-form"
        >
          Create Account
        </Button>
        {isError && (
          <div className="p-3 text-sm text-destructive bg-destructive/20 rounded-md border border-destructive">
            {error.response?.data?.message ||
              "Registration failed. Please try again."}
          </div>
        )}
        <p className="text-center text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link className="hover:underline text-primary" href="/auth/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;
