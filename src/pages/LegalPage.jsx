import { Link } from "react-router-dom";

const LegalPage = () => (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-800">
        <article className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
            <Link className="font-semibold text-emerald-700" to="/signup">← Back to sign up</Link>
            <h1 className="mt-8 text-3xl font-bold text-slate-950">CodeTrack legal information</h1>
            <section className="scroll-mt-8" id="terms">
                <h2 className="mt-10 text-2xl font-bold text-slate-950">Terms</h2>
                <p className="mt-3 leading-7">CodeTrack is currently a demonstration application. Use it only with test information. Accounts and learning data may be reset as the product changes.</p>
            </section>
            <section className="scroll-mt-8" id="privacy">
                <h2 className="mt-10 text-2xl font-bold text-slate-950">Privacy Policy</h2>
                <p className="mt-3 leading-7">This demo stores account and session information in your browser. It does not send that information to a CodeTrack server. Clear this site’s browser storage to remove it.</p>
            </section>
        </article>
    </main>
);

export default LegalPage;
