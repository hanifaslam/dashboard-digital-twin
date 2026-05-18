"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { parseAxiosError } from "@/lib/utils";
import { AuthInput, authSchema } from "@/schema/auth-schema";
import { AuthService } from "@/service/auth-service";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import PasswordInput from "@/components/common/input/password-input";
import { useAuthValue } from "@/hooks/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: isCheckingAuth } = useAuthValue();

  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isCheckingAuth, router]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<AuthInput & { remember_me?: boolean }>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      login: "",
      password: "",
      remember_me: false,
    },
    mode: "onChange",
  });

  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: () => {
      toast.success("Login Successful");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error) => {
      toast.error(parseAxiosError(error, "Login Failed"));
    },
  });

  const onSubmit = (data: AuthInput) => {
    loginMutation.mutate(data);
  };

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50/50">
      <Card className="w-full max-w-md pt-2 shadow-lg">
        <CardHeader className="flex flex-col items-center">
          <div className="w-48 h-30 flex items-center justify-center">
            <Image
              src="/logo.png"
              width={512}
              height={512}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-semibold">
            Digital Twin Management System
          </span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <Field>
                <FieldLabel className="text-sm font-normal">
                  <span>Username</span>
                  <span className="text-red-500 ml-1">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    placeholder="Enter username"
                    {...register("login")}
                    disabled={loginMutation.isPending}
                    className="border border-gray-300 p-2 h-10"
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
                        id="remember_me"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <FieldLabel htmlFor="remember_me" className="text-sm font-normal cursor-pointer">
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
              disabled={loginMutation.isPending || !isValid}
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
        </CardContent>
      </Card>
    </div>
  );
}
