import FISHeader from '../components/FISHeader';
import FISFooter from '../components/FISFooter';

export default function FISContactPage({ onNavigate }) {
  return (
    <div className="nara-responsive min-h-screen bg-[#edf3f7] text-[#123d7b]">
      <FISHeader page="contact" onNavigate={onNavigate} />

      <main>
        <section className="bg-[#0d6973] py-12 text-white">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#f4b740]">Fisheries Information Center — NARA</div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">Contact Us</h1>
            <p className="mt-3 text-base text-white/75">We are here to help — reach out to the Fisheries Information Center</p>
            <div className="mt-5 flex items-center gap-3 text-[13px] text-white/65">
              <button onClick={() => onNavigate('home')} className="transition hover:text-white">Home</button>
              <span>/</span>
              <span className="text-white">Contact Us</span>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.08fr_1.72fr] lg:px-8">
          <div className="space-y-6">
            <div className="rounded-[12px] border border-slate-200 bg-white/80 p-6 shadow-sm">
              <h2 className="mb-4 text-[15px] font-extrabold uppercase tracking-[0.12em] text-[#0d3b7c]">Fisheries Information Center</h2>
              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0d3b7c]/10 text-lg">📍</div>
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
                    <div className="mt-1 text-[15px] leading-7 text-slate-700">Monday – Friday: 8:30 AM – 4:30 PM</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[12px] border border-slate-200 bg-white/80 shadow-sm">
              <div className="h-[280px] w-full overflow-hidden">
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

          <div className="rounded-[12px] border border-slate-200 bg-white/80 p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-2xl font-extrabold text-[#103d7a]">Send an Inquiry</h2>
            <form className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Full Name *</label>
                  <input type="text" placeholder="e.g. Kamal Perera" className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-700 outline-none ring-0 transition focus:border-[#0d3b7c]" />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Email Address *</label>
                  <input type="email" placeholder="example@email.com" className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-700 outline-none transition focus:border-[#0d3b7c]" />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Phone Number</label>
                  <input type="tel" placeholder="+94 77 000 0000" className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-700 outline-none transition focus:border-[#0d3b7c]" />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Organization / Institution</label>
                  <input type="text" placeholder="Your organization" className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-700 outline-none transition focus:border-[#0d3b7c]" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Department / Area of Inquiry *</label>
                <select className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-700 outline-none transition focus:border-[#0d3b7c]">
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
                <input type="text" placeholder="Brief subject of your inquiry" className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-700 outline-none transition focus:border-[#0d3b7c]" />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Your Message *</label>
                <textarea rows="5" placeholder="Please describe your inquiry in detail..." className="w-full resize-y rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-700 outline-none transition focus:border-[#0d3b7c]" />
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-[12px] text-slate-500">* Required fields</div>
                <button type="submit" className="rounded-sm bg-[#0d3b7c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0a2f66]">Submit Inquiry</button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <FISFooter onNavigate={onNavigate} />
    </div>
  );
}
