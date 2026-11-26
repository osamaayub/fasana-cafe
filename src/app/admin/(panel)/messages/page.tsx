import { prisma } from "@lib/prisma";
import { deleteMessage, toggleMessageRead } from "@actions/admin";

export default async function MessagesPage() {
  const rows = await prisma.message.findMany({ orderBy: [{ read: "asc" }, { createdAt: "desc" }], take: 200 });
  return (
    <div>
      <h1 className="text-4xl text-ink">Messages</h1>
      <div className="mt-5 space-y-3">
        {rows.length === 0 && <p className="card p-5 text-sm text-muted">No messages yet.</p>}
        {rows.map((m) => (
          <div key={m.id} className={`card p-5 ${m.read ? "opacity-70" : "border-l-4 border-l-lamp"}`}>
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-semibold">{m.name} {m.subject && <span className="font-normal text-muted">· {m.subject}</span>}</p>
              <p className="text-xs text-muted">{m.createdAt.toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}</p>
            </div>
            <p className="text-sm text-muted">
              {m.phone && <a className="underline" href={`tel:${m.phone}`}>{m.phone}</a>}
              {m.phone && m.email && " · "}
              {m.email && <a className="underline" href={`mailto:${m.email}`}>{m.email}</a>}
            </p>
            <p className="mt-3 whitespace-pre-line text-sm">{m.body}</p>
            <div className="mt-4 flex gap-2">
              <form action={toggleMessageRead}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="read" value={m.read ? "0" : "1"} /><button className="btn-ghost py-1.5 text-xs">{m.read ? "Mark unread" : "Mark read"}</button></form>
              <form action={deleteMessage}><input type="hidden" name="id" value={m.id} /><button className="btn py-1.5 text-xs text-red-700 hover:bg-red-50">Delete</button></form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
