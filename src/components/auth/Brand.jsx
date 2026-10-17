import PropTypes from 'prop-types';

const Brand = ({ className = "", variant = "dark" }) => {
  if (variant === 'light') {
    return (
      <img
        src="/images/Dashboard Logo 1.png"
        alt="CodeTrack"
        width="131"
        height="26"
        className={`h-[22px] w-auto object-contain sm:h-[26px] ${className}`}
      />
    );
  }

  const textColor = variant === "dark" ? "text-white" : "text-gray-900";
  const accentColor = variant === "dark" ? "text-emerald-400" : "text-emerald-600";

  return (
    <div className={`flex items-center gap-2 font-semibold ${textColor} ${className}`}>
        <span className="grid grid-cols-3 gap-0.5" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => (
                <span
                    className={`size-1.5 rounded-[1px] ${[1, 2, 3, 5, 6, 7].includes(index) ? "bg-emerald-400" : "bg-emerald-600"}`}
                    key={index}
                />
            ))}
        </span>
        <span>Code<span className={accentColor}>Track</span></span>
    </div>
  );
};

Brand.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['dark', 'light']),
};

export default Brand;
