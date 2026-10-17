import PropTypes from 'prop-types';

const MetricCard = ({ icon: Icon, label, value, unit, helperText }) => {
  const accent = label === 'Current streak' ? 'text-orange-500' : label === 'Hours this week' ? 'text-teal-600' : 'text-green-600';
  return (
    <div className="min-h-36 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:min-h-0 md:p-6">
      {/* Icon and Label */}
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        {Icon && <Icon size={19} className={`${accent} md:h-5 md:w-5`} />}
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>

      {/* Value */}
      <div className="mb-3 md:mb-4">
        <div className="font-mono text-5xl font-semibold tracking-tight text-gray-950 md:text-5xl">
          {value}
          {unit && <span className={`ml-2 font-mono text-xl font-normal tracking-wide ${accent}`}>{unit}</span>}
        </div>
      </div>

      {/* Helper Text */}
      {helperText && (
        <p className="text-xs md:text-sm text-gray-600">{helperText}</p>
      )}
    </div>
  );
};

MetricCard.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
  helperText: PropTypes.string,
};

MetricCard.defaultProps = {
  icon: null,
  unit: '',
  helperText: '',
};

export default MetricCard;
