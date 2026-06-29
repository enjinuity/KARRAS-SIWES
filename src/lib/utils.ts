import { twMerge } from 'tailwind-merge';

type ClassDictionary = Record<string, boolean | null | number | string | undefined>;
type ClassArray = ClassValue[];
export type ClassValue = ClassArray | ClassDictionary | string | number | null | boolean | undefined;

function toClassName(value: ClassValue): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap(toClassName);
  }

  return Object.entries(value)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([className]) => className);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(inputs.flatMap(toClassName).join(' '));
}
