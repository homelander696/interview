import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, title, description, ctaLabel, ctaTo, className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center ${className}`}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-slate-200/80 p-4 text-slate-500">
          <Icon className="h-10 w-10" aria-hidden />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-slate-600">{description}</p>}
      {ctaLabel && ctaTo && (
        <Link to={ctaTo} className="btn-primary mt-6">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
