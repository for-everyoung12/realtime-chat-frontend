import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitialLetter(input?: string): string {
  const trimmed = input?.trim();
  if (!trimmed) return "C";
  return trimmed.charAt(0).toUpperCase();
}