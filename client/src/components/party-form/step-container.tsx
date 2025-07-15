import { ReactNode } from "react";

interface StepContainerProps {
  children: ReactNode;
}

export function StepContainer({ children }: StepContainerProps) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
