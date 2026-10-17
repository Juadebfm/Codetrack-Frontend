import PropTypes from 'prop-types';

const Goals = ({ goals }) => {
  const colors = ['bg-green-600', 'bg-teal-600', 'bg-amber-500'];

  const getProgressPercentage = (current, target) => {
    return (current / target) * 100;
  };

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <h2 className="border-b border-gray-200 px-5 py-4 text-base font-semibold text-gray-900 md:px-6">Goals</h2>

      <div className="space-y-5 px-5 py-5 md:px-6">
        {goals.map((goal, index) => {
          const percentage = getProgressPercentage(goal.current_value, goal.target_value);

          return (
            <div key={goal.id}>
              {/* Goal Title and Ratio */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{goal.title}</h3>
                <span className="hidden font-mono text-xs font-medium text-gray-500 md:inline">
                  {goal.current_value} of {goal.target_value} {goal.unit}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${colors[index % colors.length]} transition-all duration-300`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

Goals.propTypes = { goals: PropTypes.arrayOf(PropTypes.object).isRequired };

export default Goals;
