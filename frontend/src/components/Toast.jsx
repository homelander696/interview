import { Check, X } from "lucide-react";
import { useEffect } from "react";

export default function Toast({ message, type = "success", onDismiss, visible = true, duration = 3000 }) {
  useEffect(() => {
    if (!onDismiss || !visible) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, visible, duration]);

  if (!visible || !message) return null;

  const isSuccess = type === "success";
  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-soft animate-toast-in"
    >
      {isSuccess ? (
        <Check className="h-5 w-5 shrink-0 text-green-600" aria-hidden />
      ) : (
        <X className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
      )}
      <span className={isSuccess ? "text-slate-800" : "text-red-700"}>{message}</span>
    </div>
  );
}
