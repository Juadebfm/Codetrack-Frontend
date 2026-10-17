import PropTypes from "prop-types";

const AuthField = ({ id, label, error, children }) => (
    <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-900" htmlFor={id}>
            {label} <span className="text-red-500">*</span>
        </label>
        {children}
        {error && <p className="mt-1.5 text-sm text-red-600" id={`${id}-error`}>{error}</p>}
    </div>
);

AuthField.propTypes = {
    children: PropTypes.node.isRequired,
    error: PropTypes.string,
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};

export default AuthField;
