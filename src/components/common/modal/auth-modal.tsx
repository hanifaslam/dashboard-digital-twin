"use client";

import { PasswordInput } from "@/components/common/input/password-input";
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

import { useAuthModal } from "@/hooks/use-auth-modal";
import { parseAxiosError } from "@/lib/utils";
import {
  AuthInput,
  authSchema,
  registerSchema,
  RegisterInput,
} from "@/schema/auth-schema";

import { AuthService } from "@/service/auth-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function AuthModal() {
  const { isOpen, activeTab, close, setTab } = useAuthModal();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()} modal>
      <DialogContent
        className="max-w-[420px] p-0 rounded-2xl max-h-[90vh] overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <ScrollArea className="max-h-[90vh]">
          <div className="flex flex-col gap-6 p-8">
            <div className="flex flex-col items-start">
              <Image
                src="/logo.png"
                alt="Logo"
                width={56}
                height={48}
                className="mb-4 invert"
              />
              <p className="text-sm text-muted-foreground">
                Access your account to manage your digital twin assets.
              </p>
            </div>

            <div className="relative">
              <div className="flex border-b">
                <button
                  onClick={() => setTab("login")}
                  className={`flex-1 pb-3 text-sm font-medium transition-colors duration-200 ${
                    activeTab === "login"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setTab("register")}
                  className={`flex-1 pb-3 text-sm font-medium transition-colors duration-200 ${
                    activeTab === "register"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Register
                </button>
              </div>
              <div
                className="absolute bottom-0 h-0.5 w-1/2 bg-primary transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(${activeTab === "login" ? "0%" : "100%"})`,
                }}
              />
            </div>

            {activeTab === "login" ? <LoginForm /> : <RegisterForm />}

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
    formState: { errors },
  } = useForm<AuthInput>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldContent>
          <Input
            placeholder="Enter your email"
            {...register("email")}
            disabled={loginMutation.isPending}
          />
          <FieldError errors={[errors.email]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>Password</FieldLabel>
        <FieldContent>
          <PasswordInput
            placeholder="Enter your password"
            {...register("password")}
            disabled={loginMutation.isPending}
          />
          <FieldError errors={[errors.password]} />
        </FieldContent>
      </Field>

      <Button
        type="submit"
        className="w-full"
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

function RegisterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      phone_number: "",
      email: "",
      gender: "",
      birth_date: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: AuthService.register,
    onSuccess: () => {
      toast.success("Registration Successful! Please login.");
      reset();
    },
    onError: (error) => {
      toast.error(parseAxiosError(error, "Registration Failed"));
    },
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel>
          Name<span className="text-destructive ml-1">*</span>
        </FieldLabel>
        <FieldContent>
          <Input
            placeholder="Full name"
            {...register("name")}
            disabled={registerMutation.isPending}
          />
          <FieldError errors={[errors.name]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>
          Phone Number<span className="text-destructive ml-1">*</span>
        </FieldLabel>
        <FieldContent>
          <Input
            placeholder="Phone number (e.g. 0812...)"
            {...register("phone_number")}
            disabled={registerMutation.isPending}
          />
          <FieldError errors={[errors.phone_number]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>
          Email<span className="text-destructive ml-1">*</span>
        </FieldLabel>
        <FieldContent>
          <Input
            placeholder="Email address"
            {...register("email")}
            disabled={registerMutation.isPending}
          />
          <FieldError errors={[errors.email]} />
        </FieldContent>
      </Field>

      <Button
        type="submit"
        className="w-full"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}
