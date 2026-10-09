import Link from "next/link";

/* Shared styles for the dashboard tools, built on the site's colour tokens. */

export const inputClass =
  "w-full min-w-0 rounded-xl border border-line bg-bg px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted/50 transition-colors focus:border-accent focus:outline-none";

export const primaryButton =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButton =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-line px-5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50";

export const textLink = "font-semibold text-accent underline-offset-4 hover:underline";

export const card = "rounded-2xl border border-line bg-surface";

export function Field({
  label,
  htmlFor,
  hint,
  required = false,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  /** Shows a green asterisk after the label. */
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink/90">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-muted">{hint}</p>}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className={`${card} grid min-w-0 gap-4 p-5 sm:p-6`}>
      <legend className="float-left mb-1 w-full text-xs font-semibold uppercase tracking-[0.18em] text-accent">{title}</legend>
      {children}
    </fieldset>
  );
}

export function PageHeader({ title, intro, introClassName = "", children }: { title: string; intro?: string; introClassName?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl leading-[0.95] font-extrabold uppercase text-balance sm:text-5xl">{title}</h1>
        {intro && <p className={`mt-3 text-base leading-relaxed text-muted ${introClassName}`}>{intro}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex min-h-64 items-center justify-center text-sm text-muted" aria-busy="true">
      Loading…
    </div>
  );
}

export function EmptyNote({ children, href, action }: { children: React.ReactNode; href?: string; action?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-5 text-[15px] leading-relaxed text-muted">
      {children}{" "}
      {href && action && (
        <Link href={href} className={textLink}>
          {action}
        </Link>
      )}
    </div>
  );
}
