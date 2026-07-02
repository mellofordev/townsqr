import {
  HashtagIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useForm } from "@tanstack/react-form";
import * as React from "react";

import { Button } from "#/components/ui/button.tsx";
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
} from "#/components/ui/sheet.tsx";
import {
  createOrganizationChannel,
  updateOrganizationChannel,
} from "#/lib/workspace.ts";
import type { WorkspaceSettings } from "#/types/index.ts";

type Channel = WorkspaceSettings["channels"][number];
type Member = WorkspaceSettings["members"][number];

interface ChannelFormValues {
  name: string;
}

interface ChannelSheetProps {
  channel?: Channel;
  currentUserId: string;
  members: Member[];
  mode: "create" | "edit";
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
  open: boolean;
}

const channelDefaultValues: ChannelFormValues = {
  name: "",
};

export function ChannelSheet({
  channel,
  currentUserId,
  members,
  mode,
  onOpenChange,
  onSaved,
  open,
}: ChannelSheetProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [permissionMode, setPermissionMode] = React.useState("workspace");
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>(
    [],
  );
  const [memberSearch, setMemberSearch] = React.useState("");
  const isEditing = mode === "edit";
  const form = useForm({
    defaultValues: channelDefaultValues,
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        if (isEditing) {
          if (!channel) {
            return;
          }

          await updateOrganizationChannel({
            data: {
              channelId: channel.id,
              name: value.name,
            },
          });
        } else {
          await createOrganizationChannel({ data: { name: value.name } });
        }

        await onSaved();
        form.reset();
        onOpenChange(false);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : `Could not ${isEditing ? "update" : "create"} channel.`,
        );
      }
    },
    validators: {
      onSubmit: ({ value }) => {
        const name = value.name.trim();

        if (name.length < 2 || name.length > 40) {
          return {
            fields: {
              name: "Keep channel names between 2 and 40 characters.",
            },
          };
        }

        return undefined;
      },
    },
  });

  React.useEffect(() => {
    if (!open) {
      return;
    }

    form.setFieldValue("name", channel?.name ?? "");
    setError(null);
    setPermissionMode("workspace");
    setSelectedMemberIds(isEditing ? members.map((member) => member.id) : []);
    setMemberSearch("");
  }, [channel?.name, form, isEditing, members, open]);

  const adminMembers = React.useMemo(
    () => members.filter((member) => isAdminRole(member.role)),
    [members],
  );
  const selectedMembers = members.filter((member) =>
    selectedMemberIds.includes(member.id),
  );
  const scopedMembers =
    permissionMode === "admins"
      ? adminMembers.filter((member) => selectedMemberIds.includes(member.id))
      : selectedMembers;
  const availablePool = permissionMode === "admins" ? adminMembers : members;
  const availableMembers = availablePool.filter(
    (member) => !selectedMemberIds.includes(member.id),
  );
  const title = isEditing ? "Edit channel" : "Create channel";
  const description = isEditing
    ? "Update the channel name, access mode, and assigned people."
    : "Add a channel for discussions, announcements, or teams.";
  const addMember = React.useCallback((memberId: string) => {
    setSelectedMemberIds((currentIds) =>
      currentIds.includes(memberId) ? currentIds : [...currentIds, memberId],
    );
  }, []);
  const removeMember = React.useCallback((memberId: string) => {
    setSelectedMemberIds((currentIds) =>
      currentIds.filter((currentMemberId) => currentMemberId !== memberId),
    );
  }, []);
  const handlePermissionModeChange = React.useCallback(
    (nextPermissionMode: string) => {
      setPermissionMode(nextPermissionMode);
      setMemberSearch("");

      if (nextPermissionMode === "admins") {
        setSelectedMemberIds(adminMembers.map((member) => member.id));
        return;
      }

      setSelectedMemberIds(isEditing ? members.map((member) => member.id) : []);
    },
    [adminMembers, isEditing, members],
  );
  const shouldShowPeopleCard =
    isEditing || permissionMode === "selected" || permissionMode === "admins";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full data-[side=right]:border-l-0 sm:max-w-md"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <div className="grid gap-6 overflow-y-auto px-6 py-5">
            {error ? (
              <div className="rounded-3xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="channel-name">Name</Label>
              <form.Field name="name">
                {(field) => (
                  <>
                    <Input
                      id="channel-name"
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="engineering"
                      required
                      value={field.state.value}
                    />
                    {field.state.meta.errors[0] ? (
                      <p className="text-xs text-destructive">
                        {String(field.state.meta.errors[0])}
                      </p>
                    ) : null}
                  </>
                )}
              </form.Field>
            </div>

            <div className="grid gap-3 rounded-3xl bg-secondary/60 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheckIcon className="size-4 text-muted-foreground" />
                Permissions
              </div>
              <div className="grid gap-2">
                <Label htmlFor="channel-permission">Access</Label>
                <Select
                  onValueChange={handlePermissionModeChange}
                  value={permissionMode}
                >
                  <SelectTrigger
                    className="w-full bg-background"
                    id="channel-permission"
                  >
                    <SelectValue placeholder="Select access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workspace">
                      All workspace members
                    </SelectItem>
                    <SelectItem value="selected">
                      Selected people only
                    </SelectItem>
                    <SelectItem value="admins">Admins only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {shouldShowPeopleCard ? (
              <div className="grid gap-3 rounded-3xl bg-secondary/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <UserGroupIcon className="size-4 text-muted-foreground" />
                    People
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {scopedMembers.length} selected
                  </span>
                </div>
                {isEditing ? (
                  <ChannelMemberList
                    currentUserId={currentUserId}
                    members={scopedMembers}
                    onRemove={removeMember}
                  />
                ) : (
                  <CreateChannelPeoplePicker
                    availableMembers={availableMembers}
                    currentUserId={currentUserId}
                    memberSearch={memberSearch}
                    onAdd={addMember}
                    onRemove={removeMember}
                    onSearchChange={setMemberSearch}
                    selectedMembers={scopedMembers}
                  />
                )}
              </div>
            ) : null}

            <div className="rounded-3xl bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
              Permission and people changes are staged in this sheet; the
              current database model only saves channel names.
            </div>
          </div>

          <SheetFooter>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting
                    ? isEditing
                      ? "Saving..."
                      : "Creating..."
                    : isEditing
                      ? "Save changes"
                      : "Create channel"}
                </Button>
              )}
            </form.Subscribe>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

interface CreateChannelPeoplePickerProps {
  availableMembers: Member[];
  currentUserId: string;
  memberSearch: string;
  onAdd: (memberId: string) => void;
  onRemove: (memberId: string) => void;
  onSearchChange: (value: string) => void;
  selectedMembers: Member[];
}

function CreateChannelPeoplePicker({
  availableMembers,
  currentUserId,
  memberSearch,
  onAdd,
  onRemove,
  onSearchChange,
  selectedMembers,
}: CreateChannelPeoplePickerProps) {
  const normalizedMemberSearch = memberSearch.trim().toLowerCase();
  const filteredAvailableMembers = availableMembers.filter((member) => {
    if (!normalizedMemberSearch) {
      return true;
    }

    return [member.user.name, member.user.email].some((value) =>
      value.toLowerCase().includes(normalizedMemberSearch),
    );
  });

  return (
    <div className="grid gap-3">
      <div className="relative">
        <MagnifyingGlassIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
        <Input
          className="bg-background pl-9"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search people"
          value={memberSearch}
        />
      </div>

      {availableMembers.length ? (
        <div className="grid gap-2">
          <div className="text-xs font-medium text-muted-foreground">
            Available people
          </div>
          {filteredAvailableMembers.length ? (
            <div className="grid max-h-56 gap-1.5 overflow-y-auto pr-1">
              {filteredAvailableMembers.map((member) => (
                <MemberRow
                  action={
                    <Button
                      aria-label={`Add ${member.user.name}`}
                      onClick={() => {
                        onAdd(member.id);
                        onSearchChange("");
                      }}
                      size="icon-xs"
                      type="button"
                      variant="ghost"
                    >
                      <UserPlusIcon />
                    </Button>
                  }
                  key={member.id}
                  member={member}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-background px-3 py-2 text-xs text-muted-foreground">
              No people match this search.
            </div>
          )}
        </div>
      ) : null}

      {selectedMembers.length ? (
        <div className="grid gap-2">
          <div className="text-xs font-medium text-muted-foreground">
            Added people
          </div>
          <div className="grid gap-1.5">
            {selectedMembers.map((member) => (
              <MemberRow
                action={
                  isCurrentAdmin(member, currentUserId) ? null : (
                    <Button
                      aria-label={`Remove ${member.user.name}`}
                      onClick={() => onRemove(member.id)}
                      size="icon-xs"
                      type="button"
                      variant="ghost"
                    >
                      <UserMinusIcon />
                    </Button>
                  )
                }
                key={member.id}
                member={member}
                status={
                  isCurrentAdmin(member, currentUserId)
                    ? "Current admin"
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface ChannelMemberListProps {
  currentUserId: string;
  members: Member[];
  onRemove: (memberId: string) => void;
}

function ChannelMemberList({
  currentUserId,
  members,
  onRemove,
}: ChannelMemberListProps) {
  const [suspendedMemberIds, setSuspendedMemberIds] = React.useState<string[]>(
    [],
  );

  if (!members.length) {
    return (
      <div className="rounded-3xl bg-background px-3 py-2 text-xs text-muted-foreground">
        No people are assigned to this channel.
      </div>
    );
  }

  return (
    <div className="grid max-h-72 gap-1.5 overflow-y-auto pr-1">
      {members.map((member) => {
        const isSuspended = suspendedMemberIds.includes(member.id);
        const isProtectedCurrentAdmin = isCurrentAdmin(member, currentUserId);

        return (
          <MemberRow
            action={
              isProtectedCurrentAdmin ? null : (
                <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <Button
                    aria-label={`${isSuspended ? "Unsuspend" : "Suspend"} ${member.user.name}`}
                    onClick={() =>
                      setSuspendedMemberIds((currentIds) =>
                        isSuspended
                          ? currentIds.filter(
                              (memberId) => memberId !== member.id,
                            )
                          : [...currentIds, member.id],
                      )
                    }
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <NoSymbolIcon />
                  </Button>
                  <Button
                    aria-label={`Remove ${member.user.name}`}
                    onClick={() => onRemove(member.id)}
                    size="icon-xs"
                    type="button"
                    variant="destructive"
                  >
                    <UserMinusIcon />
                  </Button>
                </div>
              )
            }
            key={member.id}
            member={member}
            status={
              isProtectedCurrentAdmin
                ? "Current admin"
                : isSuspended
                  ? "Suspended"
                  : undefined
            }
          />
        );
      })}
    </div>
  );
}

interface MemberRowProps {
  action?: React.ReactNode;
  member: Member;
  status?: string;
}

function MemberRow({ action, member, status }: MemberRowProps) {
  return (
    <div className="group grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-3xl bg-background px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        {member.user.imageUrl ? (
          <img
            alt=""
            className="size-7 flex-none rounded-full object-cover"
            src={member.user.imageUrl}
          />
        ) : (
          <div className="flex size-7 flex-none items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
            {getInitials(member.user.name)}
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{member.user.name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {member.user.email}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status ? (
          <span className="rounded-3xl bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
            {status}
          </span>
        ) : null}
        {action}
      </div>
    </div>
  );
}

function getInitials(name: string) {
  const [first = "T", second] = name.trim().split(/\s+/);

  return `${first[0] ?? "T"}${second?.[0] ?? ""}`.toUpperCase();
}

function isAdminRole(role: string) {
  return role === "owner" || role === "admin";
}

function isCurrentAdmin(member: Member, currentUserId: string) {
  return member.user.id === currentUserId && isAdminRole(member.role);
}
