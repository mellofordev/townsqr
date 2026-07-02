import {
  HashtagIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
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
import { requireWorkspaceSettingsRoute } from "#/lib/route-guards.ts";
import {
  useWorkspaceSettings,
  workspaceSettingsQueryKey,
  workspaceSummaryQueryKey,
} from "#/lib/workspace.ts";
import { ChannelSheet } from "./-channel-sheet.tsx";
import { SettingsHeader } from "./-settings-header.tsx";

export const Route = createFileRoute("/settings/channels")({
  loader: requireWorkspaceSettingsRoute,
  component: ChannelsSettingsPage,
  head: () => ({
    meta: [{ title: "Channels | TownSqr Settings" }],
  }),
});

type ChannelSheetState =
  | {
      mode: "create";
    }
  | {
      channelId: string;
      mode: "edit";
    };

function ChannelsSettingsPage() {
  const { data: settings } = useWorkspaceSettings();
  const queryClient = useQueryClient();
  const [activeSheet, setActiveSheet] =
    React.useState<ChannelSheetState | null>(null);

  if (!settings) {
    return null;
  }

  const canWriteSettings =
    settings.member.role === "owner" || settings.member.role === "admin";
  const selectedChannel =
    activeSheet?.mode === "edit"
      ? settings.channels.find(
          (channel) => channel.id === activeSheet.channelId,
        )
      : undefined;
  const sheetMode = activeSheet?.mode ?? "create";

  async function invalidateWorkspaceQueries() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: workspaceSettingsQueryKey,
      }),
      queryClient.invalidateQueries({ queryKey: workspaceSummaryQueryKey }),
    ]);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-col px-6 py-8 lg:px-8">
      <SettingsHeader
        description="See the channels people can be invited into."
        title="Channels"
      >
        {canWriteSettings ? (
          <Button onClick={() => setActiveSheet({ mode: "create" })} size="sm">
            <PlusIcon data-icon="inline-start" />
            Create channel
          </Button>
        ) : null}
      </SettingsHeader>

      <ChannelSheet
        channel={selectedChannel}
        currentUserId={settings.member.userId}
        members={settings.members}
        mode={sheetMode}
        onOpenChange={(open) => {
          if (!open) {
            setActiveSheet(null);
          }
        }}
        onSaved={invalidateWorkspaceQueries}
        open={Boolean(activeSheet)}
      />

      <section className="mt-10 grid gap-3">
        <h2 className="text-sm font-medium text-foreground">
          Workspace channels
        </h2>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">Channels</CardTitle>
            <CardDescription className="text-xs">
              These channels can be selected when inviting a new member.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            {settings.channels.map((channel) => (
              <div
                className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                key={channel.id}
              >
                <div className="flex min-w-0 items-center gap-1">
                  <HashtagIcon className="size-3 flex-none text-muted-foreground" />
                  <div className="truncate text-sm font-medium">
                    {channel.name}
                  </div>
                </div>
                {canWriteSettings ? (
                  <Button
                    onClick={() =>
                      setActiveSheet({ channelId: channel.id, mode: "edit" })
                    }
                    size="xs"
                    variant="outline"
                  >
                    <PencilSquareIcon data-icon="inline-start" />
                    Edit
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
