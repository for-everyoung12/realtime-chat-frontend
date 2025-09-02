import React from "react";
import { cn } from "@/modules/shared/lib/utils";
import type { PresenceStatus } from "@/modules/chat/types/ui";

type PresenceDotProps = {
  status: PresenceStatus;
  className?: string;
  withBorder?: boolean;
};

export function PresenceDot({ status, className, withBorder = false }: PresenceDotProps) {
  const colorClass =
    status === "online"
      ? "bg-green-500"
      : status === "away"
      ? "bg-yellow-500"
      : status === "busy"
      ? "bg-red-500"
      : "bg-gray-400";

  return (
    <div
      className={cn(
        "rounded-full",
        colorClass,
        withBorder ? "border-2 border-background" : undefined,
        className
      )}
    />
  );
}


