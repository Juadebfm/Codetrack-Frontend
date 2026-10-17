import PropTypes from "prop-types";
import Brand from "./Brand.jsx";

const AuthLayout = ({ children, description, mobileMessage, title, variant }) => {
    const isSignUp = variant === "signup";

    return (
        <main className="min-h-screen overflow-x-hidden bg-white">
            <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
                <header className="flex h-22.5 items-center justify-between bg-[#10171c] px-6 lg:hidden">
                    <Brand />
                    <span className="font-mono text-xs tracking-wide text-slate-400">{mobileMessage}</span>
                </header>

                <section className="flex min-h-[calc(100vh-90px)] items-center justify-center px-6 py-7 sm:px-10 lg:order-1 lg:min-h-screen lg:px-0 lg:py-0">
                    <div className="w-full max-w-100 lg:mx-auto">
                        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-950">{title}</h1>
                        <p className="mt-1 text-[15px] text-slate-500">{description}</p>
                        {children}
                    </div>
                </section>

                <aside className="relative hidden h-109.25 self-start overflow-hidden bg-[#10171c] text-white lg:order-2 lg:block">
                    <div className="ml-12 w-[calc(100%-3rem)] max-w-136 pt-12">
                        <Brand className="mb-1" />
                        <img
                            alt="A CodeTrack activity grid showing a growing learning streak"
                            className="mt-1 h-auto w-136 max-w-none"
                            src="/images/Background%20Container.png"
                        />
                        <div className="mt-8">
                            <h2 className="text-[32px] font-bold leading-tight tracking-tight">{isSignUp ? "Day 1 starts here." : "Keep the chain alive."}</h2>
                            <p className="mt-3 max-w-97.5 text-[16px] leading-6 text-slate-400">
                                {isSignUp
                                    ? "Create your account and log your first session today. From there, you'll have a 2-day streak."
                                    : "You're one log away from extending your streak. Pick up right where you left off."}
                            </p>
                            <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-400">
                                <span className="flex size-4 items-center justify-center rounded-full border border-emerald-500 text-[10px] text-emerald-400" aria-hidden="true">&#10003;</span>
                                Free forever for your daily log.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
};

AuthLayout.propTypes = {
    children: PropTypes.node.isRequired,
    description: PropTypes.string.isRequired,
    mobileMessage: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(["signin", "signup"]).isRequired,
};

export default AuthLayout;
