import { useContext, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthField from "../components/auth/AuthField.jsx";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import PasswordField from "../components/auth/PasswordField.jsx";
import SocialLoginButton from "../components/auth/SocialLoginButton.jsx";
import { AuthContext } from "../contexts/AuthContext.jsx";

const initialValues = { displayName: "", email: "", password: "" };
const emailPattern = /^\S+@\S+\.\S+$/;

const SignUpPage = () => {
    const { signInWithProvider, signUp } = useContext(AuthContext);
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [form, setForm] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateField = (name, value) => {
        if (name === "displayName" && value.trim().length < 2) return "Enter a name with at least 2 characters.";
        if (name === "email" && !emailPattern.test(value.trim())) return "Enter a valid email address.";
        if (name === "password" && value.length < 8) return "Use at least 8 characters.";
        return undefined;
    };

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        if (errors[name]) setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
        setNotice("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = Object.fromEntries(Object.entries(form).map(([name, value]) => [name, validateField(name, value)]).filter(([, error]) => error));
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            requestAnimationFrame(() => formRef.current?.elements.namedItem(Object.keys(nextErrors)[0])?.focus());
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await signUp(form);
            if (!result.success) return setNotice(result.message);
            navigate("/dashboard", { replace: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialSignup = (provider) => {
        signInWithProvider(provider, true);
        navigate("/dashboard", { replace: true });
    };

    return (
        <AuthLayout description="Start your streak in under a minute." mobileMessage="Day 1 starts here." title="Create your account" variant="signup">
            {notice && <div aria-live="assertive" className="fixed right-4 top-4 z-50 max-w-sm rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg" role="alert">{notice}</div>}
            <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit} ref={formRef}>
                <div className="space-y-2.5">
                    <SocialLoginButton icon="/icons/github%20icon.png" onClick={() => handleSocialSignup("GitHub")} provider="GitHub" />
                    <SocialLoginButton icon="/icons/google%20icon.png" onClick={() => handleSocialSignup("Google")} provider="Google" />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 before:h-px before:flex-1 before:bg-slate-200 after:h-px after:flex-1 after:bg-slate-200">or</div>
                <div className="space-y-4">
                    <AuthField error={errors.displayName} id="displayName" label="Name">
                        <input aria-describedby={errors.displayName ? "displayName-error" : undefined} aria-invalid={Boolean(errors.displayName)} autoComplete="name" className={`h-11 w-full rounded-xl border bg-white px-3 text-base text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 ${errors.displayName ? "border-red-500" : "border-slate-200"}`} id="displayName" name="displayName" onChange={updateField} placeholder="Alex Rivera" type="text" value={form.displayName} />
                    </AuthField>
                    <AuthField error={errors.email} id="email" label="Email">
                        <input aria-describedby={errors.email ? "email-error" : undefined} aria-invalid={Boolean(errors.email)} autoComplete="email" className={`h-11 w-full rounded-xl border bg-white px-3 text-base text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 ${errors.email ? "border-red-500" : "border-slate-200"}`} id="email" name="email" onChange={updateField} placeholder="you@example.com" type="email" value={form.email} />
                    </AuthField>
                    <AuthField error={errors.password} id="password" label="Password">
                        <PasswordField describedBy="password-help" error={errors.password} onChange={updateField} placeholder="At least 8 characters" value={form.password} />
                        <p className="mt-1.5 text-sm text-slate-500" id="password-help">Use at least 8 characters.</p>
                    </AuthField>
                </div>
                <button className="h-[52px] w-full rounded-xl bg-[#16a34a] text-base font-semibold text-white shadow-[0_10px_20px_-12px_rgba(22,163,74,0.9)] transition hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70" disabled={isSubmitting} type="submit">{isSubmitting ? "Creating account…" : "Create account"}</button>
                <p className="text-sm leading-5 text-slate-500">By signing up you agree to our <Link className="font-medium text-teal-600 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" to="/legal#terms">Terms</Link> and <Link className="font-medium text-teal-600 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" to="/legal#privacy">Privacy Policy.</Link></p>
                <p className="text-center text-sm text-slate-600">Already have an account? <Link className="font-semibold text-teal-600 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" to="/signin">Log in.</Link></p>
            </form>
        </AuthLayout>
    );
};

export default SignUpPage;
