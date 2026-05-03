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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

import { useAuthModal } from "@/hooks/use-auth-modal";
import { parseAxiosError } from "@/lib/utils";
import { AuthInput, authSchema } from "@/schema/auth-schema";

import { AuthService } from "@/service/auth-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import PasswordInput from "../input/password-input";

export function AuthModal() {
  const { isOpen, close } = useAuthModal();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()} modal>
      <DialogContent
        className="sm:max-w-[500px] p-0 rounded-2xl max-h-[90vh] overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <ScrollArea className="max-h-[90vh]">
          <div className="flex flex-col gap-8 p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-48 h-30 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={512}
                  height={512}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-semibold">
                Digital Twin Management System
              </span>
            </div>

            <LoginForm />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function LoginForm() {
  const queryClient = useQueryClient();
  const { close } = useAuthModal();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AuthInput & { remember_me?: boolean }>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: () => {
      toast.success("Login Successful");
      queryClient.invalidateQueries({ queryKey: ["me"] });
      close();
    },
    onError: (error) => {
      toast.error(parseAxiosError(error, "Login Failed"));
    },
  });

  const onSubmit = (data: AuthInput) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Field>
          <FieldLabel className="text-sm font-normal">
            <span>Username or Email</span>
            <span className="text-red-500 ml-1">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              placeholder="Enter username"
              {...register("email")}
              disabled={loginMutation.isPending}
              className="border border-gray-300 p-2 h-10"
              autoComplete="off"
            />
            <FieldError errors={[errors.email]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel className="text-sm font-normal">
            <span>Password</span>
            <span className="text-red-500 ml-1">*</span>
          </FieldLabel>
          <FieldContent>
            <PasswordInput
              placeholder="Enter password"
              {...register("password")}
              disabled={loginMutation.isPending}
              autoComplete="off"
              className="h-10"
            />
            <FieldError errors={[errors.password]} />
          </FieldContent>
        </Field>

        <div className="flex items-center justify-between">
          <div className="flex flex-row items-center space-y-0 gap-2">
            <Controller
              name="remember_me"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <FieldLabel className="text-sm font-normal cursor-pointer">
              Remember Me
            </FieldLabel>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Link
          href="/forgot-password"
          className="p-0 h-auto text-sm text-primary hover:text-primary/80"
        >
          Forgot Password
        </Link>
      </div>

      <Button
        type="submit"
        variant="default"
        className="hover:bg-primary/90 border-primary/90 bg-primary w-full border p-2 text-white transition-colors font-semibold h-10"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </Button>
    </form>
  );
}
