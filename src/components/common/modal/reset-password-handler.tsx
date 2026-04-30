"use client";

import { ForgotPasswordModal } from "@/components/common/modal/forgot-password-modal";
import { parseAxiosError } from "@/lib/utils";
import { AuthService } from "@/service/auth-service";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function ResetPasswordHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [dismissed, setDismissed] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["verifyResetToken", token],
    queryFn: () => AuthService.verifyResetToken({ token: token! }),
    enabled: !!token,
    retry: false,
  });

  const isValidToken = useMemo(() => {
    return data?.valid === true && !!token;
  }, [data, token]);

  const showResetModal = useMemo(() => {
    return isValidToken && !dismissed;
  }, [isValidToken, dismissed]);

  useEffect(() => {
    if (data && !data?.valid && !dismissed) {
      toast.error("Invalid or expired reset token");
      router.replace("/");
    }
  }, [data, dismissed, router]);

  useEffect(() => {
    if (isError && error) {
      toast.error(parseAxiosError(error, "Invalid or expired reset token"));
      router.replace("/");
    }
  }, [isError, error, router]);

  const handleClose = useCallback(() => {
    setDismissed(true);
    router.replace("/");
  }, [router]);

  const handleSuccess = useCallback(() => {
    setDismissed(true);
    router.replace("/");
    toast.success("Password reset successfully! You can now login.");
  }, [router]);

  if (!token || isLoading) {
    return null;
  }

  return (
    <ForgotPasswordModal
      isOpen={showResetModal}
      onClose={handleClose}
      token={token || ""}
      onSuccess={handleSuccess}
    />
  );
}
