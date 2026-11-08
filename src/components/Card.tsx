import type { ReactNode } from "react";
import { CARD } from "@/components/styles";

interface CardProps {
  /** Extra classes, e.g. "mb-6" for spacing between cards. */
  className?: string;
  children: ReactNode;
}

/** White rounded section card used for every block on the page. */
export function Card({ className, children }: CardProps) {
  return (
    <section className={className ? `${CARD} ${className}` : CARD}>
      {children}
    </section>
  );
}
