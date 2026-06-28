import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import * as React from "react";

import { Button } from "#/components/ui/button.tsx";
import { Card } from "#/components/ui/card.tsx";
import { Input } from "#/components/ui/input.tsx";
import { Label } from "#/components/ui/label.tsx";

import {
  completeOnboarding,
  type OrganizationType,
  onboardingStatusQueryKey,
  onboardingStatusQueryOptions,
  organizationTypeOptions,
  useOnboardingStatus,
} from "#/lib/onboarding.ts";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/onboarding")({
  loader: async ({ context }) => {
    const status = await context.queryClient.ensureQueryData(
      onboardingStatusQueryOptions(),
    );

    if (!status.isAuthenticated) {
      throw redirect({ to: "/login" });
    }

    if (status.organization) {
      throw redirect({ to: "/" });
    }
  },
  component: OnboardingPage,
  head: () => ({
    meta: [{ title: "Set up workspace | TownSqr" }],
  }),
});

function createInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint8Array(8);
  crypto.getRandomValues(values);

  return Array.from(values, (value) => alphabet[value % alphabet.length]).join(
    "",
  );
}

function OnboardingPage() {
  useOnboardingStatus();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = React.useState(1);
  const [organizationName, setOrganizationName] = React.useState("");
  const [organizationType, setOrganizationType] =
    React.useState<OrganizationType>("startup");
  const [inviteCode, setInviteCode] = React.useState("");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  React.useEffect(() => {
    setInviteCode(createInviteCode());
  }, []);

  function handleContinue() {
    setError(null);

    if (organizationName.trim().length < 2) {
      setError("Enter your organization name.");
      return;
    }

    setStep(2);
  }

  async function handleFinish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      await completeOnboarding({
        data: {
          organizationName,
          organizationType,
          inviteCode,
          inviteEmail,
        },
      });
      await queryClient.invalidateQueries({
        queryKey: onboardingStatusQueryKey,
      });
      await navigate({ to: "/" });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not finish setup.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(520px,1fr)]">
      <section className="flex min-h-screen items-center justify-center border-border px-6 py-10 lg:border-r">
        <div className="w-full max-w-md">
          <div
            className="motion-safe:animate-[onboarding-step-in_220ms_ease-out]"
            key={step}
          >
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Step {step} of 2
              </p>
              <h1 className="text-3xl font-semibold tracking-normal">
                {step === 1 ? "Set up your workspace" : "Invite your team"}
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                {step === 1
                  ? "Tell us what to call your organization so TownSqr can shape the first workspace around it."
                  : "Share this invite code or send a first invite by email. You can add more people later."}
              </p>
            </div>

            {step === 1 ? (
              <form
              className="grid gap-5 space-y-5"
                onSubmit={(event) => event.preventDefault()}
              >
                <div className="grid gap-2">
                  <Label htmlFor="organization-name">Organization name</Label>
                  <Input
                    autoComplete="organization"
                    id="organization-name"
                    name="organizationName"
                    onChange={(event) =>
                      setOrganizationName(event.target.value)
                    }
                    required
                    value={organizationName}
                  />
                </div>

                <div className="grid gap-3">
                  <Label>Type of organization</Label>
                  <div className="flex flex-wrap gap-2">
                    {organizationTypeOptions.map((option) => (
                      <Button
                        aria-pressed={organizationType === option.value}
                        className={cn(
                          organizationType === option.value &&
                            "border-foreground bg-muted text-foreground",
                        )}
                        key={option.value}
                        onClick={() => setOrganizationType(option.value)}
                        type="button"
                        variant="outline"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {error ? <FormError message={error} /> : null}

                <Button onClick={handleContinue} type="button">
                  Continue
                </Button>
              </form>
            ) : (
              <form className="grid gap-5" onSubmit={handleFinish}>
                <div className="rounded-lg border bg-card px-5 py-6 text-center">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Invite code
                  </p>
                  <p className="mt-3 font-mono text-3xl font-semibold tracking-[0.18em]">
                    {inviteCode || "--------"}
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="invite-email">Invite by email</Label>
                  <Input
                    autoComplete="email"
                    id="invite-email"
                    name="inviteEmail"
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="teammate@company.com"
                    type="email"
                    value={inviteEmail}
                  />
                </div>

                {error ? <FormError message={error} /> : null}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    disabled={isPending}
                    onClick={() => setStep(1)}
                    type="button"
                    variant="outline"
                  >
                    Back
                  </Button>
                  <Button disabled={isPending || !inviteCode}>
                    {isPending ? "Finishing..." : "Finish"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <OnboardingPreview
        inviteCode={inviteCode}
        organizationName={organizationName}
        step={step}
      />
    </main>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}

function OnboardingPreview({
  inviteCode,
  organizationName,
  step,
}: {
  inviteCode: string;
  organizationName: string;
  step: number;
}) {
  return (
    <section className="hidden min-h-screen overflow-hidden bg-muted/35 px-12 py-14 lg:block">
      <div
        className="mx-auto flex h-full max-w-2xl flex-col justify-center motion-safe:animate-[onboarding-step-in_260ms_ease-out]"
        key={step}
      >
        <h2 className="text-5xl font-semibold tracking-normal">
          {step === 1
            ? "Your company square, ready to form."
            : "Bring the first people in."}
        </h2>
        <div className="relative mt-20 h-[460px]">
          <PreviewCard className="top-0 left-6 rotate-[-2deg]">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Workspace
            </p>
            <p className="mt-2 font-medium">
              {organizationName || "Your organization"}
            </p>
          </PreviewCard>
          <PreviewCard className="top-14 right-2 rotate-[2deg]">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Announcements
            </p>
            <p className="mt-2 font-medium">Launch the company feed</p>
          </PreviewCard>
          <PreviewCard className="top-48 left-24 rotate-[1deg]">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Teams
            </p>
            <p className="mt-2 font-medium">Create spaces for every group</p>
          </PreviewCard>
          <PreviewCard className="right-20 bottom-16 rotate-[-1deg]">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Invite
            </p>
            <p className="mt-2 font-mono text-lg font-semibold tracking-widest">
              {inviteCode || "--------"}
            </p>
          </PreviewCard>
        </div>
      </div>
    </section>
  );
}

function PreviewCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "absolute w-64 rounded-lg border bg-background p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      {children}
    </Card>
  );
}
