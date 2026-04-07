import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDimensions(l: number, w: number, h: number): string {
  return `${l} × ${w} × ${h} cm`;
}

export function formatUtilization(pct: number): string {
  return `${Math.round(pct)}%`;
}

export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`;
}
