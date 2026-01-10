// components/ui/password-strength.tsx
"use client";

import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements = useMemo(() => {
    const reqs: PasswordRequirement[] = [
      {
        label: "At least 8 characters",
        met: password.length >= 8,
      },
      {
        label: "Contains uppercase letter",
        met: /[A-Z]/.test(password),
      },
      {
        label: "Contains lowercase letter",
        met: /[a-z]/.test(password),
      },
      {
        label: "Contains number",
        met: /[0-9]/.test(password),
      },
      {
        label: "Contains special character",
        met: /[^A-Za-z0-9]/.test(password),
      },
    ];
    return reqs;
  }, [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter((req) => req.met).length;
    const percentage = (metCount / requirements.length) * 100;
    
    if (percentage === 0) return { label: "", color: "", value: 0 };
    if (percentage <= 40) return { label: "Weak", color: "bg-red-500", value: percentage };
    if (percentage <= 60) return { label: "Fair", color: "bg-orange-500", value: percentage };
    if (percentage <= 80) return { label: "Good", color: "bg-yellow-500", value: percentage };
    return { label: "Strong", color: "bg-green-500", value: percentage };
  }, [requirements]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password strength:</span>
          <span className={`font-medium ${
            strength.label === "Weak" ? "text-red-500" :
            strength.label === "Fair" ? "text-orange-500" :
            strength.label === "Good" ? "text-yellow-500" :
            strength.label === "Strong" ? "text-green-500" : ""
          }`}>
            {strength.label}
          </span>
        </div>
        <Progress 
          value={strength.value} 
          className="h-2"
        //   indicatorClassName={strength.color}
        />
      </div>

      <div className="space-y-1.5">
        {requirements.map((req, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm"
          >
            {req.met ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}