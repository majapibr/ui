import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import clsx from "clsx";
import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import Group from "../Group/Group";

const styles = {
  variants: {
    default: {
      root: "bg-warn-50",
      icon: "text-warn-400",
      title: "text-warn-800",
      content: "text-warn-700",
    },
    error: {
      root: "bg-error-50",
      icon: "text-error-400",
      title: "text-error-800",
      content: "text-error-700",
    },
    success: {
      root: "bg-success-50",
      icon: "text-success-400",
      title: "text-success-800",
      content: "text-success-700",
    },
  },
};

const icons: Record<keyof typeof styles["variants"], typeof XCircleIcon> = {
  default: ExclamationTriangleIcon,
  error: XCircleIcon,
  success: CheckCircleIcon,
};

export type AlertProps = {
  title: ReactNode;
  variant?: keyof typeof styles["variants"];
  children?: ReactNode;
  actions?: ReactNode;
} & Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  "title"
>;

export default function Alert({
  variant = "default",
  title,
  children,
  className,
  actions,
  ...props
}: AlertProps) {
  const Icon = icons[variant];

  return (
    <div
      className={clsx(
        "rounded-md p-4",
        styles.variants[variant].root,
        className
      )}
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon
            className={clsx("h-5 w-5", styles.variants[variant].icon)}
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3
            className={clsx(
              "text-sm font-medium",
              styles.variants[variant].title
            )}
          >
            {title}
          </h3>
          {children && (
            <div
              className={clsx("mt-2 text-sm", styles.variants[variant].content)}
            >
              {children}
            </div>
          )}
          {actions && <Group className="-mx-3 -mb-3">{actions}</Group>}
        </div>
      </div>
    </div>
  );
}