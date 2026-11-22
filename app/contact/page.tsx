"use client"

import * as React from "react"
import { CheckCircle2, Clock, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"

export default function ContactPage() {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [subject, setSubject] = React.useState("Equipment Rental Inquiry")
  const [message, setMessage] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in your name, email, and message.")
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      toast.success("Thank you for reaching out! Our rental support team will contact you within 24 hours.")
      setName("")
      setEmail("")
      setPhone("")
      setMessage("")
      setIsSubmitting(false)
    }, 600)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <MessageSquare className="size-3.5" />
          <span>Support & Inquiries</span>
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Contact Our Team
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Have a question regarding equipment availability, owner onboarding, or booking disputes? We are here to help 24/7.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Contact Info Column */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-lg font-bold text-foreground">Get In Touch Directly</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Speak directly with our logistics and verified rental specialists.
            </p>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Phone className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Direct Hotline</p>
                  <p className="font-semibold text-foreground">+1 (800) 555-RENT (7368)</p>
                  <p className="text-xs text-muted-foreground">+880 1700-123456 (Bangladesh Desk)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Mail className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email Support</p>
                  <p className="font-semibold text-foreground">support@rentora.com</p>
                  <p className="text-xs text-muted-foreground">rentals@rentora.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Headquarters</p>
                  <p className="font-semibold text-foreground">1200 Innovation Way, Suite 500</p>
                  <p className="text-xs text-muted-foreground">Chicago, IL 60601, United States</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Clock className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Operating Hours</p>
                  <p className="font-semibold text-foreground">Monday - Saturday: 8:00 AM - 10:00 PM</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Emergency machinery dispatch available 24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Assurance */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <CheckCircle2 className="size-4 text-primary" />
              <span>Verified Escrow & Insurance</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Every booking processed through Rentora is covered by our verified owner protocol and guaranteed Stripe escrow.
            </p>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs lg:col-span-7 sm:p-8">
          <h2 className="text-lg font-bold text-foreground">Send Us a Message</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Fill in the details below and we will respond promptly.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-foreground">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rafiqul Islam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rafiq@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-foreground">Phone Number</label>
                <input
                  type="text"
                  placeholder="+880 1..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Inquiry Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
                >
                  <option value="Equipment Rental Inquiry">Equipment Rental Inquiry</option>
                  <option value="Become an Equipment Owner">Become an Equipment Owner</option>
                  <option value="Payment & Stripe Question">Payment & Stripe Question</option>
                  <option value="Booking Extension">Booking Extension</option>
                  <option value="General Support">General Support</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Message *</label>
              <textarea
                required
                rows={5}
                placeholder="Describe your equipment requirements, dates, or question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
              <Send className="size-4" />
              <span>{isSubmitting ? "Sending..." : "Submit Inquiry"}</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
