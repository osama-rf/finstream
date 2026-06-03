"use client";

import { cn } from "@/lib/utils/cn";
import { getInitials } from "@/lib/utils/format";
import { getAvatarGradient, type AvatarSubject } from "@/lib/utils/avatar";

function getFallbackInitials(user?: AvatarSubject | null) {
  const firstName = user?.first_name?.trim() || "";
  const lastName = user?.last_name?.trim() || "";
  if (firstName && lastName) return getInitials(firstName, lastName);
  if (firstName) return firstName.charAt(0).toUpperCase();
  if (lastName) return lastName.charAt(0).toUpperCase();
  return "؟";
}

export function UserAvatar({
  user,
  className,
  textClassName,
  alt,
}: {
  user?: AvatarSubject | null;
  className?: string;
  textClassName?: string;
  alt?: string;
}) {
  const gradient = getAvatarGradient(user?.id);
  const avatarUrl = user?.avatar_url || undefined;
  const hasImage = Boolean(avatarUrl);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full text-white",
        hasImage ? "bg-transparent" : ["bg-gradient-to-br", gradient],
        className,
      )}
      aria-label={alt}
      title={alt}
    >
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={alt || "صورة المستخدم"} className="h-full w-full object-cover" />
      ) : (
        <span className={cn("font-bold uppercase", textClassName)}>
          {getFallbackInitials(user)}
        </span>
      )}
    </div>
  );
}
