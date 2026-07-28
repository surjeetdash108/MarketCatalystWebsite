import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Contact — MarketCatalyst",
  description: "Get in touch with the MarketCatalyst team — product questions, partnerships and press.",
};

export default function ContactPage() {
  return (
    <div className="lp-root mq-root">
      <div className="hw">
        <Nav />
        <main className="contact-page">
          <div className="contact-kicker">Contact</div>
          <h1 className="contact-title">Get in touch</h1>
          <p className="contact-sub">
            Questions about the product, a partnership idea, or press — send us a note and we&apos;ll get back to you.
          </p>
          <ContactForm />
        </main>
        <Footer />
      </div>
    </div>
  );
}
