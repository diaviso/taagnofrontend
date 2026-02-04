"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Lightbulb, Info, CheckCircle2, AlertTriangle, X } from "lucide-react";

interface TipCardProps {
  variant?: "default" | "info" | "success" | "warning";
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles = {
  default: {
    container: "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20",
    icon: <Lightbulb className="h-5 w-5 text-primary" />,
    iconBg: "bg-primary/10",
  },
  info: {
    container: "bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200",
    icon: <Info className="h-5 w-5 text-blue-600" />,
    iconBg: "bg-blue-100",
  },
  success: {
    container: "bg-gradient-to-r from-green-50 to-green-100/50 border-green-200",
    icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    iconBg: "bg-green-100",
  },
  warning: {
    container: "bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-200",
    icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    iconBg: "bg-amber-100",
  },
};

export function TipCard({
  variant = "default",
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
  icon,
}: TipCardProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const styles = variantStyles[variant];

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 animate-fade-in",
        styles.container,
        className
      )}
    >
      <div className="flex gap-4">
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            styles.iconBg
          )}
        >
          {icon || styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-sm mb-1">{title}</h4>
          )}
          <div className="text-sm text-muted-foreground">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}

export function TipStep({
  step,
  title,
  description,
  isActive = false,
  isCompleted = false,
}: {
  step: number;
  title: string;
  description?: string;
  isActive?: boolean;
  isCompleted?: boolean;
}) {
  return (
    <div className={cn(
      "flex gap-4 p-4 rounded-xl transition-all duration-300",
      isActive && "bg-primary/5 scale-[1.02]",
      isCompleted && "opacity-60"
    )}>
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
          isActive && "bg-primary text-primary-foreground shadow-glow",
          isCompleted && "bg-green-500 text-white",
          !isActive && !isCompleted && "bg-muted text-muted-foreground"
        )}
      >
        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step}
      </div>
      <div className="flex-1">
        <h4 className={cn(
          "font-medium transition-colors",
          isActive && "text-primary"
        )}>
          {title}
        </h4>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

export function OnboardingTip({
  tips,
  currentStep = 0,
}: {
  tips: { title: string; description: string }[];
  currentStep?: number;
}) {
  return (
    <div className="space-y-2">
      {tips.map((tip, index) => (
        <TipStep
          key={index}
          step={index + 1}
          title={tip.title}
          description={tip.description}
          isActive={index === currentStep}
          isCompleted={index < currentStep}
        />
      ))}
    </div>
  );
}
