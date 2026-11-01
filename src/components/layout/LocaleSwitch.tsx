"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { rememberLocale } from "@/lib/locale-cookie";

export function LocaleSwitch({ locale, onClick, ...props }: Omit<ComponentProps<typeof Link>, "locale"> & { locale: "ro" | "ru" }) {
  return <Link {...props} onClick={(event) => {
    rememberLocale(locale);
    onClick?.(event);
  }} />;
}
