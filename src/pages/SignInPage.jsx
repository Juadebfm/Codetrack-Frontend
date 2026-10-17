import { useContext, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthField from "../components/auth/AuthField.jsx";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import PasswordField from "../components/auth/PasswordField.jsx";
import SocialLoginButton from "../components/auth/SocialLoginButton.jsx";
import { AuthContext } from "../contexts/AuthContext.jsx";

const initialValues = { email: "", password: "", remember: true };
const emailPattern = /^\S+@\S+\.\S+$/;

const SignInPage = () => {
    const { signIn, signInWithProvider } = useContext(AuthContext);
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [form, setForm] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateField = (name, value) => {
        if (name === "email" && !emailPattern.test(value.trim())) return "Enter a valid email address.";
        if (name === "password" && !value) return "Enter your password.";
        return undefined;
    };

    const updateField = (event) => {
        const { checked, name, type, value } = event.target;
        const nextValue = type === "checkbox" ? checked : value;
        setForm((current) => ({ ...current, [name]: nextValue }));
        if (errors[name]) setErrors((current) => ({ ...current, [name]: validateField(name, nextValue) }));
        setNotice("");
    };

    const focusFirstError = (nextErrors) => requestAnimationFrame(() => {
        const firstName = Object.keys(nextErrors)[0];
        formRef.current?.elements.namedItem(firstName)?.focus();
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = {
            email: validateField("email", form.email),
            password: validateField("password", form.password),
        };
        Object.keys(nextErrors).forEach((key) => nextErrors[key] || delete nextErrors[key]);
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            focusFirstError(nextErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await signIn(form.email, form.password, form.remember);
            if (!result.success) return setNotice(result.message);
            navigate("/dashboard", { replace: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialLogin = (provider) => {
        signInWithProvider(provider, form.remember);
        navigate("/dashboard", { replace: true });
    };

    return (
        <AuthLayout description="Log in to keep your streak going." mobileMessage="Welcome back." title="Welcome back" variant="signin">
            {notice && <div aria-live="assertive" className="fixed right-4 top-4 z-50 max-w-sm rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg" role="alert">{notice}</div>}
            <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit} ref={formRef}>
                <div className="space-y-2.5">
                    <SocialLoginButton icon="/icons/github%20icon.png" onClick={() => handleSocialLogin("GitHub")} provider="GitHub" />
                    <SocialLoginButton icon="/icons/google%20icon.png" onClick={() => handleSocialLogin("Google")} provider="Google" />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 before:h-px before:flex-1 before:bg-slate-200 after:h-px after:flex-1 after:bg-slate-200">or</div>
                <div className="space-y-4">
                    <AuthField error={errors.email} id="email" label="Email">
                        <input aria-describedby={errors.email ? "email-error" : undefined} aria-invalid={Boolean(errors.email)} autoComplete="email" className={`h-11 w-full rounded-xl border bg-white px-3 text-base text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 ${errors.email ? "border-red-500" : "border-slate-200"}`} id="email" name="email" onChange={updateField} placeholder="you@example.com" type="email" value={form.email} />
                    </AuthField>
                    <AuthField error={errors.password} id="password" label="Password">
                        <PasswordField error={errors.password} onChange={updateField} placeholder="Your password" value={form.password} />
                    </AuthField>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-slate-600" htmlFor="remember"><input checked={form.remember} className="size-[18px] rounded accent-emerald-600" id="remember" name="remember" onChange={updateField} type="checkbox" />Remember me</label>
                    <Link className="font-medium text-teal-600 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" to="/forgot-password">Forgot password?</Link>
                </div>
                <button className="h-[52px] w-full rounded-xl bg-[#16a34a] text-base font-semibold text-white shadow-[0_10px_20px_-12px_rgba(22,163,74,0.9)] transition hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70" disabled={isSubmitting} type="submit">{isSubmitting ? "Logging in…" : "Log in"}</button>
                <p className="pt-0.5 text-center text-sm text-slate-600">New here? <Link className="font-semibold text-teal-600 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" to="/signup">Create an account.</Link></p>
            </form>
        </AuthLayout>
    );
};

export default SignInPage;
