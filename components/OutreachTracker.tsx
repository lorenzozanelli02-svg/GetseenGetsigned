"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { followUpState, formatDate } from "@/lib/dates";
import { deleteContact, listContacts, updateContact, type Contact, type ContactStatus } from "@/lib/store";
import { dueFollowUps, dueLabel, sortContacts, STATUSES, statusClass, trackerStats } from "@/lib/tracker";
import { ContactDialog } from "./ContactDialog";
import { card, Loading, PageHeader, primaryButton, textLink } from "./ui";

export function OutreachTracker() {
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [editing, setEditing] = useState<Contact | "new" | null>(null);
  const [error, setError] = useState("");

  const reload = useCallback(() => listContacts().then((c) => setContacts(sortContacts(c))), []);
  useEffect(() => {
    reload();
  }, [reload]);

  async function run(action: () => Promise<unknown>) {
    setError("");
    try {
      await action();
      await reload();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!contacts) return <Loading />;
  const stats = trackerStats(contacts);
  const due = dueFollowUps(contacts).length;

  const rowProps = {
    onEdit: (c: Contact) => setEditing(c),
    onStatus: (c: Contact, status: ContactStatus) => run(() => updateContact(c.id, { status })),
    onDone: (c: Contact) => run(() => updateContact(c.id, { followUpDate: "" })),
    onDelete: (c: Contact) => run(() => deleteContact(c.id)),
  };

  return (
    <div className="grid gap-8">
      <PageHeader title="Outreach Tracker" intro="Every club you've contacted, where it stands and when to follow up.">
        <button type="button" onClick={() => setEditing("new")} className={primaryButton}>
          Add contact
        </button>
      </PageHeader>

      {contacts.length > 0 && (
        <dl className="flex flex-wrap gap-x-8 gap-y-3">
          <Stat label="Clubs contacted" value={stats.clubs} />
          <Stat label="Replies" value={stats.replies} />
          <Stat label="Trials offered" value={stats.trials} />
          <Stat label="Follow-ups due" value={due} warn={due > 0} />
        </dl>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {contacts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-8 text-center">
          <p className="font-semibold">No contacts yet</p>
          <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-muted">
            Add a club you&rsquo;ve messaged, or write a message in the{" "}
            <Link href="/dashboard/messages" className={textLink}>
              Message Builder
            </Link>{" "}
            and save it to your tracker.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop: table */}
          <div className={`${card} hidden overflow-x-auto md:block`}>
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead className="border-b border-line text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">Club</th>
                  <th scope="col" className="px-4 py-3">Contact</th>
                  <th scope="col" className="px-4 py-3">Role</th>
                  <th scope="col" className="px-4 py-3">Date sent</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Follow-up</th>
                  <th scope="col" className="px-4 py-3">Notes</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <TableRow key={c.id} contact={c} {...rowProps} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="grid gap-3 md:hidden">
            {contacts.map((c) => (
              <ContactCard key={c.id} contact={c} {...rowProps} />
            ))}
          </ul>
        </>
      )}

      {editing && (
        <ContactDialog
          contact={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

type RowProps = {
  contact: Contact;
  onEdit: (c: Contact) => void;
  onStatus: (c: Contact, s: ContactStatus) => void;
  onDone: (c: Contact) => void;
  onDelete: (c: Contact) => void;
};

function rowTint(c: Contact) {
  const due = followUpState(c.followUpDate);
  return due?.kind === "overdue" ? "bg-danger/7" : due?.kind === "due" ? "bg-warn/7" : "";
}

function TableRow({ contact: c, onEdit, onStatus, onDone, onDelete }: RowProps) {
  return (
    <tr className={`border-b border-line last:border-0 align-top ${rowTint(c)}`} data-contact={c.club}>
      <td className="px-4 py-3.5 font-semibold">{c.club}</td>
      <td className="px-4 py-3.5">{c.contactName || <span className="text-muted">—</span>}</td>
      <td className="px-4 py-3.5 text-muted">{c.role || "—"}</td>
      <td className="px-4 py-3.5 whitespace-nowrap tabular-nums">{formatDate(c.dateSent)}</td>
      <td className="px-4 py-3">
        <StatusSelect contact={c} onStatus={onStatus} />
      </td>
      <td className="px-4 py-3.5">
        <FollowUp contact={c} onDone={onDone} />
      </td>
      <td className="max-w-56 px-4 py-3.5 text-muted">
        <p className="line-clamp-2" title={c.notes}>
          {c.notes || "—"}
        </p>
      </td>
      <td className="px-4 py-3">
        <RowActions contact={c} onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  );
}

function ContactCard({ contact: c, onEdit, onStatus, onDone, onDelete }: RowProps) {
  return (
    <li className={`${card} grid gap-3 p-4 ${rowTint(c)}`} data-contact={c.club}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold break-words">{c.club}</p>
          <p className="text-sm text-muted">{[c.contactName, c.role].filter(Boolean).join(" · ") || "No contact name"}</p>
        </div>
        <StatusSelect contact={c} onStatus={onStatus} />
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.12em] text-muted">Sent</dt>
          <dd className="tabular-nums">{formatDate(c.dateSent)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.12em] text-muted">Follow-up</dt>
          <dd>
            <FollowUp contact={c} onDone={onDone} />
          </dd>
        </div>
      </dl>
      {c.notes && <p className="text-sm whitespace-pre-line text-muted">{c.notes}</p>}
      <RowActions contact={c} onEdit={onEdit} onDelete={onDelete} />
    </li>
  );
}

function StatusSelect({ contact: c, onStatus }: Pick<RowProps, "contact" | "onStatus">) {
  return (
    <select
      aria-label={`Status for ${c.club}`}
      value={c.status}
      onChange={(e) => onStatus(c, e.target.value as ContactStatus)}
      className={`min-h-9 shrink-0 cursor-pointer appearance-none rounded-full border bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239aa8a0'%3E%3Cpath d='M5 7l5 6 5-6z'/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_10px_center] bg-no-repeat py-1 pr-8 pl-3 text-sm font-semibold ${statusClass(c.status)}`}
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value} className="bg-surface text-ink">
          {s.label}
        </option>
      ))}
    </select>
  );
}

function FollowUp({ contact: c, onDone }: Pick<RowProps, "contact" | "onDone">) {
  if (!c.followUpDate) return <span className="text-muted">—</span>;
  const due = followUpState(c.followUpDate);
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="whitespace-nowrap tabular-nums">{formatDate(c.followUpDate)}</span>
      {due && (
        <span className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-semibold ${due.kind === "overdue" ? "text-danger" : "text-warn"}`}>{dueLabel(due)}</span>
          <button type="button" onClick={() => onDone(c)} className="cursor-pointer text-xs text-muted underline underline-offset-2 hover:text-accent">
            Done
          </button>
        </span>
      )}
    </div>
  );
}

/** Edit opens the dialog; Delete asks once more before removing the row. */
function RowActions({ contact: c, onEdit, onDelete }: Pick<RowProps, "contact" | "onEdit" | "onDelete">) {
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const btn = "min-h-9 cursor-pointer rounded-full px-3 text-sm font-semibold transition-colors";
  return (
    <div className="flex items-center justify-end gap-1">
      <button type="button" onClick={() => onEdit(c)} className={`${btn} text-ink/80 hover:text-accent`} aria-label={`Edit ${c.club}`}>
        Edit
      </button>
      <button
        type="button"
        aria-label={confirming ? `Confirm delete ${c.club}` : `Delete ${c.club}`}
        onClick={() => {
          if (confirming) return onDelete(c);
          setConfirming(true);
          timer.current = setTimeout(() => setConfirming(false), 4000);
        }}
        className={`${btn} ${confirming ? "bg-danger/15 text-danger" : "text-muted hover:text-danger"}`}
      >
        {confirming ? "Confirm delete" : "Delete"}
      </button>
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className={`font-display text-4xl leading-none font-extrabold tabular-nums ${warn ? "text-warn" : "text-accent"}`}>{value}</dd>
    </div>
  );
}
