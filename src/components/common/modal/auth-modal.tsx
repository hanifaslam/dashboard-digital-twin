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
        className="sm:max-w-[500px] p-0 rounded-2xl max-h-[90vh] overflow-hidden bg-slate-950/90 border border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.4),0_0_15px_rgba(6,182,212,0.03)] backdrop-blur-md"
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
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
              <span className="text-xl font-semibold">
                Digital Twin Dashboard
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
      login: "",
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
              {...register("login")}
              disabled={loginMutation.isPending}
              className="border border-cyan-500/20 bg-slate-900/40 p-2 h-10 text-white placeholder:text-slate-500 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              autoComplete="off"
            />
            <FieldError errors={[errors.login]} />
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
              className="border border-cyan-500/20 bg-slate-900/40 text-white placeholder:text-slate-500 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20 h-10"
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
                  id="remember_me_modal"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <FieldLabel
              htmlFor="remember_me_modal"
              className="text-sm font-normal cursor-pointer text-slate-300"
            >
              Remember Me
            </FieldLabel>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Link
          href="/forgot-password"
          className="h-auto p-0 text-sm text-cyan-400 transition-colors hover:text-cyan-300"
        >
          Forgot Password
        </Link>
      </div>

      <Button
        type="submit"
        variant="default"
        className="h-10 w-full border border-cyan-500/20 bg-slate-950/60 p-2 font-semibold text-white transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/10"
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
