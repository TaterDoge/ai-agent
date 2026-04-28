type TailwindDemoProps = {
  appName: string;
};

const features = [
  "Shared Tailwind utilities",
  "Shared theme tokens",
  "Rendered from @repo/ui",
];

export function TailwindDemo({ appName }: TailwindDemoProps) {
  return (
    <section className="w-full max-w-4xl rounded-card border border-white/10 bg-[linear-gradient(135deg,rgba(79,124,255,0.16),rgba(255,255,255,0.04))] p-6 shadow-card backdrop-blur md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <span className="inline-flex w-fit items-center rounded-full border border-brand-500/20 bg-brand-50 px-3 py-1 font-semibold text-brand-700 text-xs uppercase tracking-[0.24em]">
            shared ui
          </span>
          <div>
            <h2 className="font-semibold text-3xl text-white md:text-4xl">
              Tailwind runs in {appName} and still styles shared TSX.
            </h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-slate-100 text-sm shadow-black/10 shadow-sm"
              key={feature}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
