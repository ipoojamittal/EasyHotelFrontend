"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

/**
 * ThemeProvider — wraps next-themes.
 *
 * The root layout uses defaultTheme="light" (the warm customer canvas) and
 * enableSystem. The dashboard layout will *force* the dark theme via
 * <ThemeProvider forcedTheme="dark"> in its own nested provider, so the
 * dashboard is always dark regardless of the user's system/customer preference.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
