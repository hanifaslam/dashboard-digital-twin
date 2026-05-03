"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import React, { forwardRef, useState } from "react";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hint?: React.ReactNode;
  error?: React.ReactNode;
  showToggle?: boolean;
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ hint, error, showToggle = true, className, ...inputProps }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div>
        <div className="relative">
          <Input
            ref={ref}
            type={visible ? "text" : "password"}
            className={[className ?? "", "pr-10"].filter(Boolean).join(" ")}
            {...inputProps}
          />

          {showToggle && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              aria-label={visible ? "Hide password" : "Show password"}
              onClick={() => setVisible((v) => !v)}
              className="absolute top-1/2 right-1 -translate-y-1/2"
              tabIndex={-1}
            >
              {visible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {hint && !error && (
          <p className="text-muted-foreground mt-1 text-sm">{hint}</p>
        )}
        {error && <p className="text-destructive mt-1 text-sm">{error}</p>}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
