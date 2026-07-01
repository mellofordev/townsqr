import type * as React from "react";

interface OnboardingStepShellProps {
  children: React.ReactNode;
  description: string;
  preview: React.ReactNode;
  stepLabel: string;
  title: string;
}

export function OnboardingStepShell({
  children,
  description,
  preview,
  stepLabel,
  title,
}: OnboardingStepShellProps) {
  return (
    <main className="grid min-h-screen bg-background text-foreground lg:h-svh lg:min-h-0 lg:overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(520px,1fr)]">
      <section className="flex min-h-screen items-center justify-center border-border/30 px-6 py-10 lg:h-svh lg:min-h-0 lg:border-r">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {stepLabel}
            </p>
            <h1 className="text-3xl font-semibold tracking-normal">{title}</h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          {children}
        </div>
      </section>

      <section className="hidden h-svh overflow-hidden bg-amber-50/15 px-12 py-10 lg:block">
        <div className="mx-auto flex h-full max-w-2xl flex-col justify-center">
          {preview}
        </div>
      </section>
    </main>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}
