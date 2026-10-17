import PropTypes from "prop-types";

const SocialLoginButton = ({ icon, onClick, provider }) => (
    <button
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        onClick={onClick}
        type="button"
    >
        <img alt="" aria-hidden="true" className="size-4 object-contain" src={icon} />
        Continue with {provider}
    </button>
);

SocialLoginButton.propTypes = {
    icon: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    provider: PropTypes.string.isRequired,
};

export default SocialLoginButton;
