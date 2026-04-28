"use client";

import type { ReactNode } from "react";

type ButtonProps = {
  appName: string;
  children: ReactNode;
  className?: string;
};

export const Button = ({ children, className, appName }: ButtonProps) => (
  <button
    className={className}
    onClick={() => console.log(`Hello from your ${appName} app!`)}
    type="button"
  >
    {children}
  </button>
);
