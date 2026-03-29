import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// ==================== FORM MODAL HEADER ====================
interface FormModalHeaderProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function FormModalHeader({
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  title,
  subtitle,
  className,
}: FormModalHeaderProps) {
  return (
    <div className={cn("flex items-center gap-4 pb-4 border-b border-gray-100", className)}>
      <div className={cn(
        "flex items-center justify-center w-12 h-12 rounded-xl shadow-sm",
        iconBgColor
      )}>
        <Icon className={cn("w-6 h-6", iconColor)} />
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ==================== FORM SECTION ====================
interface FormSectionProps {
  title?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "highlight" | "subtle";
}

export function FormSection({
  title,
  icon: Icon,
  iconColor = "text-gray-500",
  children,
  className,
  variant = "default",
}: FormSectionProps) {
  const variantStyles = {
    default: "bg-white border border-gray-100",
    highlight: "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100",
    subtle: "bg-gray-50/50 border border-gray-100",
  };

  return (
    <div className={cn(
      "rounded-xl p-4 space-y-4",
      variantStyles[variant],
      className
    )}>
      {title && (
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100/80">
          {Icon && <Icon className={cn("w-4 h-4", iconColor)} />}
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}

// ==================== FORM FIELD GROUP ====================
interface FormFieldGroupProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function FormFieldGroup({
  children,
  columns = 2,
  className,
}: FormFieldGroupProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
}

// ==================== STYLED LABEL ====================
interface StyledLabelProps {
  children: React.ReactNode;
  required?: boolean;
  icon?: LucideIcon;
  className?: string;
}

export function StyledLabel({
  children,
  required,
  icon: Icon,
  className,
}: StyledLabelProps) {
  return (
    <label className={cn(
      "flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5",
      className
    )}>
      {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
      <span>{children}</span>
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

// ==================== STYLED INPUT WRAPPER ====================
interface StyledInputWrapperProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function StyledInputWrapper({
  children,
  icon: Icon,
  iconColor = "text-gray-400",
  className,
}: StyledInputWrapperProps) {
  if (!Icon) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Icon className={cn("w-4 h-4", iconColor)} />
      </div>
      <div className="[&_input]:pl-10 [&_select]:pl-10 [&_textarea]:pl-10">
        {children}
      </div>
    </div>
  );
}

// ==================== FORM ACTIONS ====================
interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormActions({
  children,
  className,
}: FormActionsProps) {
  return (
    <div className={cn(
      "flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100",
      className
    )}>
      {children}
    </div>
  );
}

// ==================== GRADIENT BUTTON ====================
interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "danger" | "warning";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  loading?: boolean;
}

export function GradientButton({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  loading,
  className,
  disabled,
  ...props
}: GradientButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25",
    success: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/25",
    danger: "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-red-500/25",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-lg shadow-lg transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}

// ==================== INFO CARD ====================
interface InfoCardProps {
  icon?: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  borderColor?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function InfoCard({
  icon: Icon,
  iconColor = "text-blue-600",
  bgColor = "bg-blue-50",
  borderColor = "border-blue-200",
  title,
  description,
  children,
  className,
}: InfoCardProps) {
  return (
    <div className={cn(
      "rounded-xl p-4 border",
      bgColor,
      borderColor,
      className
    )}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn("mt-0.5", iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}

// ==================== STYLED TEXTAREA ====================
interface StyledTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  icon?: LucideIcon;
}

export const StyledTextarea = React.forwardRef<HTMLTextAreaElement, StyledTextareaProps>(
  ({ label, required, icon: Icon, className, ...props }, ref) => {
    return (
      <div>
        {label && <StyledLabel required={required} icon={Icon}>{label}</StyledLabel>}
        <textarea
          ref={ref}
          className={cn(
            "w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white",
            "text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
            "transition-all duration-200 resize-none",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
StyledTextarea.displayName = "StyledTextarea";
