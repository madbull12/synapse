"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Building2, Upload, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { generalSettingsSchema, GeneralSettingsValues } from "@/features/workspace/schemas/workspace-settings";

interface WorkspaceGeneralFormProps {
  workspaceId: string;
  initialData: GeneralSettingsValues & { slug: string }; // Keep slug for display
}

export function WorkspaceGeneralForm({ workspaceId, initialData }: WorkspaceGeneralFormProps) {
  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      name: initialData.name,
      imageUrl: initialData.imageUrl,
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const workspaceName = form.watch("name") || "Workspace";
  const currentImageUrl = form.watch("imageUrl");

  const fallbackInitials = workspaceName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const onSubmit = async (values: GeneralSettingsValues) => {
    try {
      console.log("Saving workspace settings for ID:", workspaceId, values);
      toast.success("Workspace settings updated successfully.");
      form.reset(values);
    } catch (error) {
      toast.error("Failed to update workspace settings.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      form.setValue("imageUrl", fakeUrl, { shouldDirty: true });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-medium text-foreground flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            Workspace Profile
          </h2>
          <p className="text-xs text-muted-foreground">
            This is your workspace&apos;s visible identity across the platform.
          </p>
        </div>

        {/* Workspace Avatar */}
        <div className="flex items-center gap-5">
          <Avatar className="size-16  border border-border">
            <AvatarImage src={currentImageUrl} alt={workspaceName} className="object-cover" />
            <AvatarFallback className=" bg-muted text-foreground font-semibold text-base">
              {fallbackInitials || "WS"}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="relative gap-2 h-8 text-xs">
                <Upload className="size-3.5" />
                Upload logo
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
              </Button>
              {currentImageUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => form.setValue("imageUrl", "", { shouldDirty: true })}
                >
                  Remove
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Recommended: Square PNG, JPG or SVG, at least 256x256px.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input className="text-xs" id="name" disabled={isSubmitting} {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>


          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">Workspace URL Handle</Label>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="size-3" /> Permanent
              </span>
            </div>
            <div className="flex rounded-md opacity-80">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-xs">
                synapse.app/
              </span>
              <Input
                id="slug"
                className="rounded-l-none bg-muted/50 cursor-not-allowed"
                value={initialData.slug}
                disabled
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Your workspace URL identifier cannot be changed once created.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !form.formState.isDirty} className="gap-2">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}