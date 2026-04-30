"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { parseAxiosError } from "@/lib/utils";
import {
  resetPasswordSchema,
  ResetPasswordFormValues,
} from "@/schema/auth-schema";
import { AuthService } from "@/service/auth-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSuccess: () => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  token,
  onSuccess,
}: ForgotPasswordModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordFormValues & { token: string }) =>
      AuthService.resetPassword(data),
    onSuccess: () => {
      toast.success("Password has been reset successfully");
      queryClient.invalidateQueries({ queryKey: ["me"] });
      reset();
      onSuccess();
    },
    onError: (error) => {
      toast.error(parseAxiosError(error, "Failed to reset password"));
    },
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    resetPasswordMutation.mutate({ ...data, token });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal>
      <DialogContent
        className="max-w-[420px] p-0 rounded-2xl overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Reset Password</DialogTitle>
        <div className="flex flex-col gap-6 p-8">
          <div className="flex flex-col items-start">
            <Image
              src="/logo.png"
              alt="Logo"
              width={56}
              height={48}
              className="mb-4 invert"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-primary">
              Reset Password
            </h2>
            <p className="text-sm text-muted-foreground">
              Please enter your new password below to regain access to your
              account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field>
              <FieldLabel>New Password</FieldLabel>
              <FieldContent>
                <Input
                  type="password"
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  {...register("new_password")}
                />
                <FieldError errors={[errors.new_password]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Confirm Password</FieldLabel>
              <FieldContent>
                <Input
                  type="password"
                  placeholder="Re-type your new password"
                  autoComplete="new-password"
                  {...register("confirm_password")}
                />
                <FieldError errors={[errors.confirm_password]} />
              </FieldContent>
            </Field>

            <Button
              type="submit"
              className="w-full"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="text-primary hover:underline font-medium"
              >
                Terms of Service
              </Link>
            </p>
            <p>
              and{" "}
              <Link
                href="/privacy"
                className="text-primary hover:underline font-medium"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
