import PropTypes from "prop-types";
import { useState } from "react";

const PasswordField = ({ describedBy, error, id = "password", onChange, placeholder, value }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative">
            <input
                aria-describedby={[describedBy, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined}
                aria-invalid={Boolean(error)}
                className={`h-11 w-full rounded-xl border bg-white px-3 pr-14 text-base text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 ${error ? "border-red-500" : "border-slate-200"}`}
                id={id}
                name={id}
                onChange={onChange}
                placeholder={placeholder}
                type={isVisible ? "text" : "password"}
                value={value}
            />
            <button
                aria-label={isVisible ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-14 items-center justify-center rounded-r-xl font-mono text-[10px] font-bold text-slate-500 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                onClick={() => setIsVisible((visible) => !visible)}
                type="button"
            >
                {isVisible ? "HIDE" : "SHOW"}
            </button>
        </div>
    );
};

PasswordField.propTypes = {
    describedBy: PropTypes.string,
    error: PropTypes.string,
    id: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
};

export default PasswordField;
