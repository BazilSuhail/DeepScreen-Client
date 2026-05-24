import { Bone, SkeletonHeader, SkeletonPage } from "@/components/skeletons/primitives";

const pane = "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-emerald-100 bg-card dark:border-white/10";

// Rows of the conversation list.
export function ChatListSkeleton({ rows = 6 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0">
          <Bone className="h-11 w-11 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex justify-between gap-2">
              <Bone className="h-3.5 w-1/2" />
              <Bone className="h-3 w-10" />
            </div>
            <Bone className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Alternating bubbles for the message area of an open thread.
export function ChatThreadBodySkeleton() {
  const rows = [
    { me: false, w: "w-56" },
    { me: true, w: "w-40" },
    { me: false, w: "w-72" },
    { me: true, w: "w-64" },
    { me: false, w: "w-48" },
  ];
  return (
    <output aria-busy="true" className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <span className="sr-only">Loading messages</span>
      {rows.map((r, i) => (
        <div key={i} className={`flex items-end gap-2 ${r.me ? "flex-row-reverse" : ""}`}>
          {!r.me && <Bone className="h-7 w-7 rounded-full" />}
          <Bone className={`h-10 max-w-[70%] rounded-lg ${r.w}`} />
        </div>
      ))}
    </output>
  );
}

// Mirrors /chats/candidate and /chats/recruiter: header, list pane + thread pane (thread hidden on mobile).
export default function ChatSkeleton() {
  return (
    <SkeletonPage label="Loading messages" className="flex h-dvh flex-col gap-4 px-4 py-4 sm:px-6 lg:gap-6 lg:px-8 lg:py-6 2xl:px-10">
      <SkeletonHeader back actions={1} />
      <div className="flex min-h-0 flex-1 gap-4">
        <div className={`${pane} w-full lg:w-96 lg:flex-none`}>
          <div className="border-b border-border p-3">
            <Bone className="h-11 w-full rounded-md" />
          </div>
          <ChatListSkeleton />
        </div>
        <div className={`${pane} hidden flex-1 lg:flex`}>
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Bone className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Bone className="h-4 w-32" />
              <Bone className="h-3 w-24" />
            </div>
          </div>
          <div className="flex-1 px-6 py-4">
            <ChatThreadBodySkeleton />
          </div>
          <div className="border-t border-border p-3">
            <Bone className="h-11 w-full rounded-md" />
          </div>
        </div>
      </div>
    </SkeletonPage>
  );
}
