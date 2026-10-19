import FISHeader from '../components/FISHeader';
import FISFooter from '../components/FISFooter';
import InternalPageBanner from '../components/InternalPageBanner';
import { services } from '../data/services';

export default function FISSectionPage({ page, title, description, onNavigate, currentUser, onLogout }) {
  return (
    <div className="nara-responsive flex min-h-screen flex-col bg-[#edf3f7] text-[#123d7b]">
      <FISHeader page={page} onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} />

      <main className="flex-1">
        <InternalPageBanner title={title} description={description} />

        <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {page === 'services' ? (
            <div>
              <div className="mb-8 border-b border-[#b9cbd8] pb-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0b568d]">Ecosystem Services</div>
                <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#124a78] sm:text-3xl">Supporting healthy waters and thriving communities</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <article key={service.title} className="group overflow-hidden border border-[#c4d3dd] bg-white shadow-[0_2px_6px_rgba(21,67,98,0.08)] transition hover:-translate-y-1 hover:border-[#0b568d] hover:shadow-md">
                    <div className="h-40 overflow-hidden border-b-2 border-[#f0b429] bg-slate-200">
                      <img src={service.image} alt={service.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    </div>
                    <div className="p-5">
                      <h2 className="text-lg font-bold text-[#124a78]">{service.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{service.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
              <h2 className="text-2xl font-extrabold text-[#103d7a]">{title} information</h2>
              <p className="mt-4 max-w-2xl leading-7 text-slate-600">Explore information and updates from the Fisheries Information Center.</p>
            </div>
          )}
        </section>
      </main>

      <FISFooter onNavigate={onNavigate} />
    </div>
  );
}