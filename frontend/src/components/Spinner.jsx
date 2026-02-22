import { Loader2 } from "lucide-react";

export default function Spinner({ size = 24, className = "" }) {
  return (
    <Loader2
      className={`animate-spin text-brand-600 ${className}`}
      size={size}
      aria-hidden="true"
    />
  );
}
