import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`w-full rounded-3xl bg-surface p-5 text-left shadow-[0_2px_16px_rgba(58,46,53,0.06)] ${className}`}
    >
      {children}
    </Tag>
  );
}
