"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import Link from "next/link";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useLogin } from "../hooks/mutations/use-auth";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

const Example = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: login, isPending, isError, error } = useLogin();

  const [passwordVisible, setPasswordVisible] = useState(false);

  function onSubmit(values: z.infer<typeof formSchema>) {
    login(values, {
      onError: (error) => {
        // form.setError("password", {
        //   type: "manual",
        //   message:
        //     error.response?.data?.message || "Login failed. Please try again.",
        // });
      },
    });
  }

  return (
    <div className="w-full max-w-sm border rounded p-4">
      <form
        className="space-y-4 z-50 relative"
        id="login-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-2xl">Welcome back</h1>
          <p className="text-muted-foreground text-sm">
            Enter your credentials to access your account
          </p>
        </div>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                id="email"
                aria-invalid={fieldState.invalid}
                placeholder="you@example.com"
                autoComplete="off"
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
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>

                <Link
                  className="text-muted-foreground text-sm hover:underline"
                  href="#"
                >
                  Forgot password?
                </Link>
              </div>
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

        <Button loading={isPending} className="w-full" type="submit">
          Sign In
        </Button>
        {isError && (
          <div className="p-3 text-sm text-destructive bg-destructive/20 rounded-md border border-destructive">
            {error.response?.data?.message || "Login failed. Please try again."}
          </div>
        )}
        <p className="text-center text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link className="hover:underline text-primary" href="/auth/register">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Example;
