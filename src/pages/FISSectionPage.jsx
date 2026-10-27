import FISHeader from '../components/FISHeader';
import FISFooter from '../components/FISFooter';
import InternalPageBanner from '../components/InternalPageBanner';
import FishForecastPage from './FishForecastPage';

export default function FISSectionPage({ page, title, description, onNavigate, currentUser, onLogout }) {
  return (
    <div className="nara-responsive flex min-h-screen flex-col bg-[#edf3f7] text-[#123d7b]">
      <FISHeader page={page} onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} />

      <main className="flex-1">
        <InternalPageBanner title={title} description={description} />

        <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {page === 'services' ? <FishForecastPage onNavigate={onNavigate} currentUser={currentUser} onLogout={onLogout} embedded /> : (
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