import { Moon } from "lucide-react";

type StatusIndicatorProps = {
  status: "online" | "offline" | "sleep";
};

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  if (status === "sleep") {
    return (
      <span className="absolute bottom-0.5 right-0.5 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-yellow-300 text-amber-900 shadow-[0_0_0_2px_rgba(255,255,255,0.9)]">
        <Moon size={14} aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      className={`absolute bottom-0.5 right-0.5 z-20 h-7 w-7 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(255,255,255,0.9)] ${
        status === "online" ? "bg-green-500" : "bg-red-500"
      }`}
    />
  );
}
