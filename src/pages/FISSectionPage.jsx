import FISHeader from '../components/FISHeader';
import FISFooter from '../components/FISFooter';

export default function FISSectionPage({ page, title, description, onNavigate }) {
  return (
    <div className="nara-responsive flex min-h-screen flex-col bg-[#edf3f7] text-[#123d7b]">
      <FISHeader page={page} onNavigate={onNavigate} />

      <main className="flex-1">
        <section className="fics-page-banner">
          <div className="fics-page-banner-inner">
            <div className="fics-page-banner-eyebrow">Fisheries Information Center</div>
            <h1>{title}</h1>
            <p className="fics-page-banner-copy">{description}</p>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            <h2 className="text-2xl font-extrabold text-[#103d7a]">{title} information</h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              This section is being prepared with the latest information from NARA. Use the navigation above to explore another area of the Fisheries Information Center.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="mt-7 rounded-sm bg-[#0d3b7c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0a2f66]"
            >
              Return to Home
            </button>
          </div>
        </section>
      </main>

      <FISFooter onNavigate={onNavigate} />
    </div>
  );
}