import { Bell, Hash, Plus, Search } from "lucide-react";
import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";

type MotionDivProps = Pick<
  HTMLMotionProps<"div">,
  "animate" | "initial" | "transition"
>;

interface Step2PreviewProps {
  channelNames: string[];
  organizationName: string;
}

const PREVIEW_EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const fallbackChannelNames = ["general", "announcements", "team-updates"];
const previewMessages = [
  {
    author: "Maya Chen",
    avatar: "/faces/face1.png",
    message:
      "Welcome to the channel. Share blockers here so the right team can jump in quickly.",
    meta: "People Ops · 9:14 AM",
  },
  {
    author: "Arjun Rao",
    avatar: "/faces/face2.png",
    message:
      "I added the onboarding checklist and pinned the launch notes for everyone joining today.",
    meta: "Product · 9:18 AM",
  },
  {
    author: "Nina Patel",
    avatar: "/faces/face3.png",
    message:
      "Great. Engineering will post deploy updates here before the company announcement goes out.",
    meta: "Engineering · 9:24 AM",
  },
];

function getPanelTransform(y = 0, scale = 1) {
  return `translate3d(0, ${y}px, 0) scale(${scale})`;
}

function formatChannelName(channelName: string) {
  return channelName.trim().toLowerCase().replace(/\s+/g, "-");
}

function getChannelKey(channelName: string) {
  return formatChannelName(channelName) || channelName;
}

export function Step2Preview({
  channelNames,
  organizationName,
}: Step2PreviewProps) {
  const shouldReduceMotion = useReducedMotion();
  const previewChannelNames =
    channelNames.length > 0 ? channelNames : fallbackChannelNames;
  const workspaceName = organizationName.trim() || "Your workspace";
  const panelMotion = (delay: number): MotionDivProps =>
    shouldReduceMotion
      ? {
          animate: { transform: getPanelTransform() },
          initial: false,
        }
      : {
          animate: { opacity: 1, transform: getPanelTransform() },
          initial: {
            opacity: 0,
            transform: getPanelTransform(18, 0.98),
          },
          transition: { delay, duration: 0.42, ease: PREVIEW_EASE_OUT },
        };

  return (
    <>
      <h2 className="max-w-xl text-5xl leading-[1.05] font-semibold tracking-normal">
        Start with the rooms work needs.
      </h2>

      <div className="relative mt-10 h-[560px] overflow-visible">
        <motion.div
          className="absolute top-0 left-0 h-[560px] w-[1040px] overflow-hidden rounded-2xl border border-border shadow-[0_22px_60px_rgba(15,23,42,0.08)]"
          {...panelMotion(0.04)}
        >
          <div className="grid h-full grid-cols-[300px_1fr]">
            <aside className="flex min-w-0 flex-col border-border border-r bg-white">
              <div className="border-border border-b p-5">
                <div className="flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {workspaceName}
                    </p>
                    <p className="text-xs text-muted-foreground">Workspace</p>
                  </div>
                </div>
                <div className="relative mt-4">
                  <Search
                    aria-hidden="true"
                    className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground"
                  />
                  <div className="h-9 rounded-full bg-muted/70 pl-9 text-sm leading-9 text-muted-foreground">
                    Search workspace
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5">
                <div>
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground/70 uppercase">
                      Channels
                    </p>
                    <Plus
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                  </div>
                  <div className="mt-2 grid gap-1">
                    {previewChannelNames
                      .slice(0, 6)
                      .map((channelName, index) => {
                        const isActive = index === 0;

                        return (
                          <div
                            className={
                              isActive
                                ? "flex h-9 min-w-0 items-center gap-3 rounded-md bg-muted px-2 text-sm font-medium text-foreground"
                                : "flex h-9 min-w-0 items-center gap-3 rounded-md px-2 text-sm text-muted-foreground"
                            }
                            key={getChannelKey(channelName)}
                          >
                            <span
                              className={
                                isActive
                                  ? "flex size-6 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600"
                                  : "flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
                              }
                            >
                              <Hash aria-hidden="true" className="size-3.5" />
                            </span>
                            <span className="truncate">
                              {formatChannelName(channelName)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </aside>

            <section className="min-w-0 bg-white">
              <div className="flex h-16 items-center justify-between border-border border-b bg-background px-6">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    #{formatChannelName(previewChannelNames[0] ?? "general")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Workspace conversation
                  </p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bell aria-hidden="true" className="size-4" />
                  <div className="-space-x-2 flex">
                    {previewMessages.map((message) => (
                      <img
                        alt={`${message.author} avatar`}
                        className="size-8 rounded-full bg-muted object-cover ring-2 ring-background"
                        decoding="async"
                        key={message.author}
                        src={message.avatar}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 p-8">
                {previewMessages.map((message) => (
                  <div
                    className="flex w-[560px] gap-3 p-5"
                    key={message.author}
                  >
                    <img
                      alt={`${message.author} avatar`}
                      className="size-10 shrink-0 rounded-full bg-muted object-cover"
                      decoding="async"
                      src={message.avatar}
                    />
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <p className="text-sm font-semibold">
                          {message.author}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {message.meta}
                        </p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {message.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </>
  );
}
