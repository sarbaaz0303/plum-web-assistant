import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export function getRandomElement<T>(list: T[]): T {
 return list[Math.floor(Math.random() * list.length)];
}
