"use client";

import { useEffect, useRef, useState } from "react";
import { addDays, todayISO } from "@/lib/dates";
import { addContact, updateContact, type Contact, type NewContact } from "@/lib/store";
import { STATUSES } from "@/lib/tracker";
import { Field, inputClass, primaryButton, secondaryButton } from "./ui";

/** Add or edit a tracker row in a modal dialog. */
export function ContactDialog({ contact, onClose, onSaved }: { contact: Contact | null; onClose: () => void; onSaved: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<NewContact>(() =>
    contact
      ? { club: contact.club, contactName: contact.contactName, role: contact.role, dateSent: contact.dateSent, status: contact.status, followUpDate: contact.followUpDate, notes: contact.notes }
      : { club: "", contactName: "", role: "", dateSent: todayISO(), status: "sent", followUpDate: addDays(todayISO(), 7), notes: "" },
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const set = (key: keyof NewContact) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.club.trim()) {
      setError("Add the club name.");
      return;
    }
    try {
      const clean = { ...form, club: form.club.trim(), contactName: form.contactName.trim(), role: form.role.trim(), notes: form.notes.trim() };
      if (contact) await updateContact(contact.id, clean);
      else await addContact(clean);
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="contact-dialog-title"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-line bg-surface p-0 text-ink backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} className="grid gap-4 p-5 sm:p-7" noValidate>
        <h2 id="contact-dialog-title" className="font-display text-3xl font-extrabold uppercase">
          {contact ? "Edit contact" : "Add contact"}
        </h2>
        <Field label="Club" htmlFor="contact-club">
          <input id="contact-club" value={form.club} onChange={set("club")} className={inputClass} maxLength={80} required autoFocus />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact name" htmlFor="contact-name">
            <input id="contact-name" value={form.contactName} onChange={set("contactName")} className={inputClass} maxLength={60} />
          </Field>
          <Field label="Role" htmlFor="contact-role">
            <input id="contact-role" value={form.role} onChange={set("role")} className={inputClass} maxLength={60} placeholder="e.g. Manager" />
          </Field>
          <Field label="Date sent" htmlFor="contact-sent">
            <input id="contact-sent" type="date" value={form.dateSent} onChange={set("dateSent")} className={inputClass} />
          </Field>
          <Field label="Status" htmlFor="contact-status">
            <select id="contact-status" value={form.status} onChange={set("status")} className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field
          label="Follow-up date"
          htmlFor="contact-follow"
          hint={
            form.followUpDate ? (
              <button type="button" onClick={() => setForm((f) => ({ ...f, followUpDate: "" }))} className="cursor-pointer underline underline-offset-4 hover:text-accent">
                No follow-up
              </button>
            ) : (
              "No follow-up set."
            )
          }
        >
          <input id="contact-follow" type="date" value={form.followUpDate} onChange={set("followUpDate")} className={`${inputClass} sm:max-w-56`} />
        </Field>
        <Field label="Notes" htmlFor="contact-notes">
          <textarea id="contact-notes" value={form.notes} onChange={set("notes")} rows={3} className={inputClass} maxLength={500} />
        </Field>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3 pt-1">
          <button type="button" onClick={() => ref.current?.close()} className={secondaryButton}>
            Cancel
          </button>
          <button type="submit" className={primaryButton}>
            {contact ? "Save changes" : "Add contact"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
