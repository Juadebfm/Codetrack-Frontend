import PropTypes from 'prop-types';
import { getDailyMinutes } from '../../utils/dashboardMetrics';

const Heatmap = ({ logs, asOf }) => {
  const dailyData = getDailyMinutes(logs, asOf, 371);
  const weeks = Array.from({ length: 53 }, (_, week) => dailyData.slice(week * 7, week * 7 + 7));
  const months = weeks.map((week, index) => {
    const label = new Date(`${week[0].date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    return index === 0 || label !== new Date(`${weeks[index - 1][0].date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) ? label : '';
  });

  const getColor = (minutes) => {
    const intensity = minutes === 0 ? 0 : minutes < 30 ? 1 : minutes < 60 ? 2 : minutes < 90 ? 3 : 4;
    const colors = [
      'bg-[#ebedf0]',
      'bg-[#bbf7d0]',
      'bg-[#86efac]',
      'bg-[#22c55e]',
      'bg-[#15803d]',
    ];
    return colors[intensity];
  };

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 md:px-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900">Your contribution heatmap</h2>
        <div className="flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-medium text-[#15803d]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" aria-hidden="true" /><span>On track</span>
        </div>
      </div>

      {/* Heatmap Grid - Responsive with horizontal scroll */}
      <div className="px-5 py-5 md:px-6">
        <div className="overflow-x-auto pb-2 [scrollbar-width:thin]">
          <div className="w-full min-w-[460px] md:min-w-0">
            {/* Month Labels */}
            <div className="mb-2 ml-9 grid grid-cols-[repeat(26,minmax(0,1fr))] gap-1 md:grid-cols-[repeat(53,minmax(0,1fr))]">
              {months.map((month, index) => (
                <div key={index} className={`min-w-0 text-[10px] text-gray-500 ${index < 27 ? 'hidden md:block' : 'block'}`}>
                  {month}
                </div>
              ))}
            </div>

            {/* Heatmap */}
            <div className="flex gap-1">
              {/* Day Labels */}
              <div className="mr-2 flex flex-col gap-1">
                {['', 'Tue', '', 'Thu', '', 'Sat', ''].map((day, i) => (
                  <div key={i} className="flex h-3 items-center">
                    {day && <span className="text-xs font-medium text-gray-600">{day}</span>}
                  </div>
                ))}
              </div>

              {/* Heatmap Grid */}
              <div className="grid min-w-0 flex-1 grid-cols-[repeat(26,minmax(0,1fr))] gap-1 md:grid-cols-[repeat(53,minmax(0,1fr))]">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className={`min-w-0 flex-col gap-1 ${weekIdx < 27 ? 'hidden md:flex' : 'flex'}`}>
                    {week.map((day) => (
                      <button type="button" key={day.date} className={`aspect-square w-full min-w-3 rounded-sm ${getColor(day.minutes)} transition-all hover:ring-2 hover:ring-[#16a34a] focus-visible:outline-2 focus-visible:outline-[#15803d]`} aria-label={`${day.date}: ${day.minutes} minutes logged`} title={`${day.date}: ${day.minutes} minutes`} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600">Less</span>
          <div className="flex gap-1" aria-hidden="true">
            {['bg-[#ebedf0]', 'bg-[#bbf7d0]', 'bg-[#86efac]', 'bg-[#22c55e]', 'bg-[#15803d]'].map((color, i) => (
              <div key={i} className={`h-3 w-3 rounded-sm ${color}`} />
            ))}
          </div>
          <span className="text-xs font-medium text-gray-600">More</span>
        </div>

        {/* Helper Text */}
        <p className="mt-3 text-xs text-gray-500">
          Hover or focus any square to see that day&apos;s entries. Darker green means more logged.
        </p>
      </div>
    </section>
  );
};

Heatmap.propTypes = { logs: PropTypes.arrayOf(PropTypes.object).isRequired, asOf: PropTypes.string.isRequired };

export default Heatmap;
