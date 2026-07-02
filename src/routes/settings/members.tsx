import { HashtagIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";

import { Button } from "#/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card.tsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import { Input } from "#/components/ui/input.tsx";
import { Label } from "#/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select.tsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet.tsx";
import { requireWorkspaceSettingsRoute } from "#/lib/route-guards.ts";
import {
  createOrganizationInvite,
  updateOrganizationMemberRole,
  useWorkspaceSettings,
  workspaceSettingsQueryKey,
  workspaceSummaryQueryKey,
} from "#/lib/workspace.ts";
import { SettingsHeader } from "./-settings-header.tsx";

export const Route = createFileRoute("/settings/members")({
  loader: requireWorkspaceSettingsRoute,
  component: MembersSettingsPage,
  head: () => ({
    meta: [{ title: "Members | TownSqr Settings" }],
  }),
});

const roleOptions = ["owner", "admin", "member"] as const;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteMemberForm {
  channelAccess: "all-current" | "selected-only";
  channelIds: string[];
  email: string;
  role: string;
}

const inviteMemberDefaultValues: InviteMemberForm = {
  channelAccess: "all-current",
  channelIds: [],
  email: "",
  role: "member",
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function MembersSettingsPage() {
  const { data: settings } = useWorkspaceSettings();
  const queryClient = useQueryClient();
  const [isInviteSheetOpen, setIsInviteSheetOpen] = React.useState(false);
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [roleError, setRoleError] = React.useState<string | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = React.useState<string | null>(
    null,
  );
  const inviteForm = useForm({
    defaultValues: inviteMemberDefaultValues,
    onSubmit: async ({ value }) => {
      setInviteError(null);

      try {
        await createOrganizationInvite({
          data: {
            channelAccess: value.channelAccess,
            channelIds:
              value.channelAccess === "selected-only" ? value.channelIds : [],
            email: value.email,
            role: value.role,
          },
        });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: workspaceSettingsQueryKey,
          }),
          queryClient.invalidateQueries({ queryKey: workspaceSummaryQueryKey }),
        ]);
        inviteForm.reset();
        setIsInviteSheetOpen(false);
      } catch (caughtError) {
        setInviteError(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not send invitation.",
        );
      }
    },
    validators: {
      onSubmit: ({ value }) => {
        const fields: Partial<Record<keyof InviteMemberForm, string>> = {};

        if (!emailPattern.test(value.email.trim().toLowerCase())) {
          fields.email = "Enter a valid email address.";
        }

        if (
          value.channelAccess === "selected-only" &&
          value.channelIds.length === 0
        ) {
          fields.channelIds = "Select at least one channel.";
        }

        return Object.keys(fields).length ? { fields } : undefined;
      },
    },
  });

  if (!settings) {
    return null;
  }

  const pendingInvites = settings.invites.filter(
    (invite) => invite.status === "pending",
  );
  const canWriteSettings =
    settings.member.role === "owner" || settings.member.role === "admin";

  async function updateMemberRole(memberId: string, role: string) {
    setRoleError(null);
    setUpdatingMemberId(memberId);

    try {
      await updateOrganizationMemberRole({
        data: {
          memberId,
          role,
        },
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workspaceSettingsQueryKey }),
        queryClient.invalidateQueries({ queryKey: workspaceSummaryQueryKey }),
      ]);
    } catch (caughtError) {
      setRoleError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not update member role.",
      );
    } finally {
      setUpdatingMemberId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-col px-6 py-8 lg:px-8">
      <SettingsHeader
        description="Review members, adjust roles, and invite people with channel access."
        title="Members"
      >
        {canWriteSettings ? (
          <Sheet open={isInviteSheetOpen} onOpenChange={setIsInviteSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <PlusIcon data-icon="inline-start" />
                Invite member
              </Button>
            </SheetTrigger>
            <SheetContent
              className="w-full data-[side=right]:border-l-0 sm:max-w-md"
              onEscapeKeyDown={(event) => event.preventDefault()}
              onInteractOutside={(event) => event.preventDefault()}
            >
              <SheetHeader>
                <SheetTitle>Invite member</SheetTitle>
                <SheetDescription>
                  Set the member role and choose which channels they can access.
                </SheetDescription>
              </SheetHeader>
              <form
                className="flex min-h-0 flex-1 flex-col"
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void inviteForm.handleSubmit();
                }}
              >
                <div className="grid gap-5 overflow-y-auto px-6 py-5">
                  {inviteError ? (
                    <div className="rounded-3xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {inviteError}
                    </div>
                  ) : null}

                  <div className="grid gap-2">
                    <Label htmlFor="invite-email">Email</Label>
                    <inviteForm.Field name="email">
                      {(field) => (
                        <>
                          <Input
                            id="invite-email"
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            placeholder="name@company.com"
                            required
                            type="email"
                            value={field.state.value}
                          />
                          {field.state.meta.errors[0] ? (
                            <p className="text-xs text-destructive">
                              {String(field.state.meta.errors[0])}
                            </p>
                          ) : null}
                        </>
                      )}
                    </inviteForm.Field>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="invite-role">Role</Label>
                    <inviteForm.Field name="role">
                      {(field) => (
                        <Select
                          name={field.name}
                          onValueChange={field.handleChange}
                          value={field.state.value}
                        >
                          <SelectTrigger className="w-full" id="invite-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((role) => (
                              <SelectItem key={role} value={role}>
                                {toTitleCase(role)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </inviteForm.Field>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="channel-access">Channel access</Label>
                    <inviteForm.Field name="channelAccess">
                      {(field) => (
                        <Select
                          name={field.name}
                          onValueChange={(value) => {
                            const nextChannelAccess =
                              value as InviteMemberForm["channelAccess"];

                            field.handleChange(nextChannelAccess);

                            if (nextChannelAccess === "all-current") {
                              inviteForm.setFieldValue("channelIds", []);
                            }
                          }}
                          value={field.state.value}
                        >
                          <SelectTrigger className="w-full" id="channel-access">
                            <SelectValue placeholder="Select channel access" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-current">
                              All current channels
                            </SelectItem>
                            <SelectItem value="selected-only">
                              Selected channels only
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </inviteForm.Field>
                    <p className="text-muted-foreground text-xs">
                      Choose whether this invite starts with every channel or a
                      selected set.
                    </p>
                  </div>

                  <inviteForm.Subscribe
                    selector={(state) => state.values.channelAccess}
                  >
                    {(channelAccess) =>
                      channelAccess === "selected-only" ? (
                        <inviteForm.Field name="channelIds">
                          {(field) => {
                            const selectedChannels = settings.channels.filter(
                              (channel) =>
                                field.state.value.includes(channel.id),
                            );

                            return (
                              <div className="grid gap-2">
                                <Label htmlFor="invite-channels">
                                  Channels
                                </Label>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Input
                                      className="cursor-pointer"
                                      id="invite-channels"
                                      placeholder="Select channels"
                                      readOnly
                                      value={selectedChannels
                                        .map((channel) => channel.name)
                                        .join(", ")}
                                    />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="max-h-64 overflow-y-auto">
                                    {settings.channels.map((channel) => (
                                      <DropdownMenuCheckboxItem
                                        checked={field.state.value.includes(
                                          channel.id,
                                        )}
                                        key={channel.id}
                                        onCheckedChange={(checked) =>
                                          field.handleChange(
                                            checked
                                              ? Array.from(
                                                  new Set([
                                                    ...field.state.value,
                                                    channel.id,
                                                  ]),
                                                )
                                              : field.state.value.filter(
                                                  (channelId) =>
                                                    channelId !== channel.id,
                                                ),
                                          )
                                        }
                                        onSelect={(event) =>
                                          event.preventDefault()
                                        }
                                      >
                                        <HashtagIcon className="size-4 text-muted-foreground" />
                                        <span className="truncate">
                                          {channel.name}
                                        </span>
                                      </DropdownMenuCheckboxItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                {field.state.meta.errors[0] ? (
                                  <p className="text-xs text-destructive">
                                    {String(field.state.meta.errors[0])}
                                  </p>
                                ) : null}
                              </div>
                            );
                          }}
                        </inviteForm.Field>
                      ) : null
                    }
                  </inviteForm.Subscribe>
                </div>

                <SheetFooter>
                  <inviteForm.Subscribe
                    selector={(state) => state.isSubmitting}
                  >
                    {(isSubmitting) => (
                      <Button disabled={isSubmitting} type="submit">
                        {isSubmitting ? "Sending..." : "Send invitation"}
                      </Button>
                    )}
                  </inviteForm.Subscribe>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        ) : null}
      </SettingsHeader>

      <div className="mt-10 grid gap-10">
        <section className="grid gap-3">
          <h2 className="text-sm font-medium text-foreground">People</h2>
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm">Organization members</CardTitle>
              <CardDescription className="text-xs">
                Current organization members and their workspace role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roleError ? (
                <div className="mb-3 rounded-3xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {roleError}
                </div>
              ) : null}
              <div className="grid gap-3">
                {settings.members.map((member) => (
                  <div
                    className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_8rem] sm:items-center"
                    key={member.id}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {member.user.imageUrl ? (
                        <img
                          alt=""
                          className="size-9 rounded-full object-cover"
                          src={member.user.imageUrl}
                        />
                      ) : (
                        <div className="flex size-9 flex-none items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                          {getInitials(member.user.name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {member.user.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {member.user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex h-8 w-32 items-center sm:justify-self-end">
                      {canWriteSettings &&
                      member.user.id !== settings.member.userId ? (
                        <Select
                          disabled={updatingMemberId === member.id}
                          onValueChange={(role) => {
                            void updateMemberRole(member.id, role);
                          }}
                          value={
                            roleOptions.includes(
                              member.role as (typeof roleOptions)[number],
                            )
                              ? member.role
                              : "member"
                          }
                        >
                          <SelectTrigger
                            aria-label="Member role"
                            className="w-full"
                            size="sm"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {toTitleCase(option)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex h-8 w-full items-center justify-start px-3 text-sm font-medium">
                          {toTitleCase(member.role)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-3">
          <h2 className="text-sm font-medium text-foreground">Invitations</h2>
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm">Pending invitations</CardTitle>
              <CardDescription className="text-xs">
                People who have been invited but have not joined yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingInvites.length ? (
                <div className="grid gap-3">
                  {pendingInvites.map((invite) => (
                    <div
                      className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                      key={invite.id}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {invite.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Invited {formatDate(invite.createdAt)} as{" "}
                          {toTitleCase(invite.role)}
                          {invite.channelIds.length
                            ? ` to ${invite.channelIds
                                .map(
                                  (channelId) =>
                                    settings.channels.find(
                                      (channel) => channel.id === channelId,
                                    )?.name,
                                )
                                .filter(Boolean)
                                .join(", ")}`
                            : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <span className="text-xs font-medium capitalize text-muted-foreground">
                          {invite.status}
                        </span>
                        {canWriteSettings ? (
                          <code className="font-mono text-xs font-medium">
                            {invite.inviteCode}
                          </code>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-sm text-muted-foreground">
                  No pending invitations.
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function getInitials(name: string) {
  const [first = "T", second] = name.trim().split(/\s+/);

  return `${first[0] ?? "T"}${second?.[0] ?? ""}`.toUpperCase();
}

function toTitleCase(value: string) {
  return `${value[0]?.toUpperCase() ?? ""}${value.slice(1)}`;
}
