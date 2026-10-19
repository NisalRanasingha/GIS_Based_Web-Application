import { useState } from 'react';
import FISHeader from '../components/FISHeader';
import FISFooter from '../components/FISFooter';
import LoadingOverlay from '../components/LoadingOverlay';
import InternalPageBanner from '../components/InternalPageBanner';
import CenterAlert from '../components/CenterAlert';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function FISContactPage({ onNavigate, currentUser, onLogout }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (type, message) => setFeedback({ type, message });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const inquiry = Object.fromEntries(formData.entries());

    if (inquiry.fullName.trim().length < 2) {
      showFeedback('error', 'Please enter your full name.');
      return;
    }
    if (!inquiry.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) {
      showFeedback('error', 'Please enter a valid email address.');
      return;
    }
    if (inquiry.department === '-- Select Department --') {
      showFeedback('error', 'Please select a department.');
      return;
    }
    if (inquiry.subject.trim().length < 2) {
      showFeedback('error', 'Please enter a subject.');
      return;
    }
    if (inquiry.message.trim().length < 10) {
      showFeedback('error', 'Your message must contain at least 10 characters.');
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiry),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Unable to submit the inquiry.');
      }

      form.reset();
      showFeedback('success', result.message || 'Your inquiry was submitted successfully.');
    } catch (error) {
      showFeedback(
        'error',
        error instanceof TypeError
          ? 'Unable to connect to the server. Please make sure the backend is running and try again.'
          : error.message || 'Unable to submit the inquiry. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nara-responsive min-h-screen bg-[#edf3f7] text-[#123d7b]">
      <FISHeader page="contact" onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} />

      {isSubmitting && <LoadingOverlay />}
      <CenterAlert type={feedback?.type} message={feedback?.message} onClose={() => setFeedback(null)} />

      <main>
        <InternalPageBanner title="Contact Us" description="We are here to help — reach out to the Fisheries Information Center" />

        <section className="mx-auto grid max-w-[1440px] gap-7 border-t-4 border-[#0b568d] bg-[#eaf2f7] px-4 py-10 sm:px-6 lg:grid-cols-[1.08fr_1.72fr] lg:px-8">
          <div className="space-y-6">
            <div className="border border-[#b9cbd8] bg-white shadow-[0_2px_8px_rgba(21,67,98,0.08)]">
              <h2 className="border-b-4 border-[#f0b429] bg-[#124a78] px-5 py-4 text-[14px] font-bold uppercase tracking-[0.12em] text-white">Fisheries Information Center</h2>
              <div className="p-5">
              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#e7f1f6] text-lg">📍</div>
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Address</div>
                    <div className="mt-1 text-[15px] leading-7 text-slate-700">NARA, Crow Island, Mattakkuliya, Colombo 15, Sri Lanka</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0d3b7c]/10 text-lg">📞</div>
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Phone / Fax</div>
                    <div className="mt-1 text-[15px] leading-7 text-slate-700">+94 11 2522 189 · Fax: +94 11 2521 932</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0d3b7c]/10 text-lg">✉️</div>
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Email</div>
                    <div className="mt-1 text-[15px] leading-7 text-slate-700">fis@nara.ac.lk</div>
                   
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0d3b7c]/10 text-lg">🕒</div>
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Office Hours</div>
                    <div className="mt-1 text-[15px] leading-7 text-slate-700">Monday – Friday: 8:30 AM – 4:15 PM</div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            <div className="overflow-hidden border border-[#b9cbd8] bg-white shadow-[0_2px_8px_rgba(21,67,98,0.08)]">
              <div className="border-b-4 border-[#0b568d] bg-[#124a78] px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white">Location map</div>
              <div className="h-[240px] w-full overflow-hidden">
                <iframe
                  title="NARA Location"
                  src="https://www.google.com/maps?q=National%20Aquatic%20Resources%20Research%20and%20Development%20Agency%20(NARA)&z=15&output=embed"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          <div className="border border-[#b9cbd8] bg-white p-5 shadow-[0_2px_8px_rgba(21,67,98,0.08)] sm:p-7">
            <h2 className="mb-5 border-b border-[#d4e0e7] pb-3 text-2xl font-bold text-[#124a78]">Send an Inquiry</h2>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Full Name *</label>
                  <input type="text" name="fullName" placeholder="e.g. Kamal Perera" required minLength="2" maxLength="120" className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-700 outline-none ring-0 transition focus:border-[#0d3b7c]" />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Email Address *</label>
                  <input type="email" name="email" placeholder="example@email.com" required maxLength="255" className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-700 outline-none transition focus:border-[#0d3b7c]" />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="94770000000"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="40"
                    onChange={(event) => {
                      event.target.value = event.target.value.replace(/\D/g, '');
                    }}
                    className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-700 outline-none focus:border-[#0d3b7c]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Organization / Institution</label>
                  <input type="text" name="organization" placeholder="Your organization" maxLength="160" className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-700 outline-none focus:border-[#0d3b7c]" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Department / Area of Inquiry *</label>
                <select name="department" required className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-700 outline-none focus:border-[#0d3b7c]">
                  <option>-- Select Department --</option>
                  <option>General Inquiry</option>
                  <option>Fish Stock &amp; Research</option>
                  <option>Oceanographic Data</option>
                  <option>Aquaculture</option>
                  <option>Market Information</option>
                  <option>Publications &amp; Reports</option>
                  <option>Licensing &amp; Registration</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Subject *</label>
                <input type="text" name="subject" placeholder="Brief subject of your inquiry" required minLength="2" maxLength="200" className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-700 outline-none focus:border-[#0d3b7c]" />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Your Message *</label>
                <textarea name="message" rows="5" placeholder="Please describe your inquiry in detail..." required minLength="10" maxLength="5000" className="w-full resize-y rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-700 outline-none focus:border-[#0d3b7c]" />
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-[12px] text-slate-500">* Required fields</div>
                <button type="submit" disabled={isSubmitting} className="rounded-sm bg-[#0d3b7c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0a2f66] disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          </div>
          
        </section>
  </main>

      <FISFooter onNavigate={onNavigate} />
    </div>
  );
}
