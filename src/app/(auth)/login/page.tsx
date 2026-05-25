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
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <Card className="w-full max-w-md pt-2 rounded-2xl bg-slate-950/90 border border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.4),0_0_15px_rgba(6,182,212,0.03)] backdrop-blur-md text-white">
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
          <span className="text-xl font-semibold mt-2 text-white">
            Digital Twin Dashboard
          </span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <Field>
                <FieldLabel className="text-sm font-normal text-slate-300">
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
                <FieldLabel className="text-sm font-normal text-slate-300">
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
                        id="remember_me"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <FieldLabel htmlFor="remember_me" className="text-sm font-normal cursor-pointer text-slate-300">
                    Remember Me
                  </FieldLabel>
                </div>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <Link
                href="/forgot-password"
                className="p-0 h-auto text-sm text-cyan-400 transition-colors hover:text-cyan-300"
              >
                Forgot Password
              </Link>
            </div>

            <Button
              type="submit"
              variant="default"
              className="h-10 w-full border border-cyan-500/20 bg-slate-950/60 p-2 font-semibold text-white transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/10"
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
