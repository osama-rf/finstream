"use client";

import { usePathname, useRouter } from "next/navigation";

export function LangToggle() {
  const pathname = usePathname();
  const router = useRouter();

  const isEn = pathname.startsWith("/en");

  function toggle() {
    if (isEn) {
      // /en/control-center → /control-center
      router.push(pathname.replace(/^\/en/, "") || "/control-center");
    } else {
      // /control-center → /en/control-center
      router.push("/en" + pathname);
    }
  }

  return (
    <button
      onClick={toggle}
      title={isEn ? "التبديل للعربية" : "Switch to English"}
      className="inline-flex h-10 items-center gap-1 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] px-3 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-soft)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
    >
      {isEn ? "ع" : "EN"}
    </button>
  );
}
