"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Send } from "lucide-react";

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      subject: String(fd.get("subject") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Could not send message.");
      }
      setDone(true);
      (e.target as HTMLFormElement).reset();
      toast.success("Message sent! I'll get back to you soon.");
    } catch (err) {
      toast.error((err as Error).message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mt-6 rounded-md border border-[#00ff88]/40 bg-[#00ff88]/10 p-6 text-center">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-[#00ff88]">Thank you!</p>
        <p className="mt-2 text-sm text-white/80">Your message landed. I&apos;ll be in touch shortly.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setDone(false)}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required maxLength={120} placeholder="Your name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required maxLength={200} placeholder="you@example.com" />
        </div>
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required maxLength={200} placeholder="What's it about?" />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required maxLength={4000} rows={6} placeholder="Tell me about your project..." />
      </div>
      <Button type="submit" disabled={submitting} variant="primary" size="lg">
        {submitting ? "Sending..." : (
          <>
            <Send size={14} /> Send Message
          </>
        )}
      </Button>
    </form>
  );
}
