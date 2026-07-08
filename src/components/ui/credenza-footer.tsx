"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

interface ModalFooterProps {
  formId: string;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onCancel: () => void;
}

export function ModalFooter({
  formId,
  submitLabel = "Save changes",
  cancelLabel = "Cancel",
  isLoading = false,
  onCancel,
}: ModalFooterProps) {
  return (
    <Field
      orientation="horizontal"
      className="w-full flex-col-reverse sm:flex-row items-center sm:justify-end gap-2"
    >
      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-1/2"
        onClick={onCancel}
        disabled={isLoading}
      >
        {cancelLabel}
      </Button>
      <Button
        className="w-full sm:w-1/2"
        type="submit"
        form={formId}
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </Field>
  );
}
