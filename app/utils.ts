import { useMemo } from "react";
import { useMatches } from "remix";

import type { User } from "~/models/user.server";

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export const getColors = function (n: number, angle: number = 360 / 6.5): Array<string> {
  return [...Array(n).keys()].map(i => hsl2hex((i * angle) % 360, 0.5, 0.6))
}

// input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
export const hsl2rgb = function (h: number, s: number, l: number): Array<number> {
  let a = s * Math.min(l, 1-l)
  let f = (n: number, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k-3, 9-k, 1), -1);
  return [f(0),f(8),f(4)];
} 

export const rangetoHex = function(x: number): string {
  const hex = Math.round(x * 255).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

export const hsl2hex = function (h: number, s: number, l: number): string {
  const rgb = hsl2rgb(h, s, l)
  return "#" + rangetoHex(rgb[0]) + rangetoHex(rgb[1]) + rangetoHex(rgb[2])
}