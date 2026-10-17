import { Zap, Plus } from 'lucide-react';
import PropTypes from 'prop-types';

const RecentLog = ({ logs, asOf, onAdd }) => {
  const asOfDate = new Date(asOf);
  const asOfDay = asOfDate.toISOString().slice(0, 10);
  const hasLogToday = logs.some((entry) => new Date(entry.logged_at).toISOString().slice(0, 10) === asOfDay);
  const logEntries = [...logs].sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at)).slice(0, 4);
  const formatTimestamp = (value) => {
    const date = new Date(value);
    const difference = Math.floor((asOfDate - date) / 86400000);
    const day = difference < 1 ? 'Today' : difference < 2 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
    return `${day} · ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })}`;
  };

  const tagColors = {
    react: 'bg-blue-100 text-blue-700',
    algorithms: 'bg-purple-100 text-purple-700',
    'css-grid': 'bg-green-100 text-green-700',
    sql: 'bg-orange-100 text-orange-700',
  };

  return (
    <section className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 md:px-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900">Recent log</h2>
        <button type="button" onClick={onAdd} className="hidden items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-green-700 md:flex">
          <Plus size={16} />
          <span>Add entry</span>
        </button>
      </div>

      {/* Log Items */}
      <div className="px-5 py-5 md:px-6">
        {/* Empty State Alert */}
        {!hasLogToday && <button type="button" onClick={onAdd} className="mb-4 flex w-full items-center gap-3 rounded-lg border border-dashed border-green-500 bg-green-50 p-4 text-left hover:bg-green-100 focus-visible:outline-2 focus-visible:outline-green-600">
          <Zap size={18} className="md:w-5 md:h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-xs md:text-sm text-green-900">Nothing logged yet today.</p>
            <p className="mt-0.5 text-xs text-green-700">Log your first 20 minutes →</p>
          </div>
        </button>}

        {/* Log Entries */}
        {logEntries.map((entry) => (
          <div key={entry.id} className="flex items-start justify-between gap-3 border-b border-gray-200 py-3 last:border-b-0">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {/* Tags */}
              <div className="shrink-0">
                {[entry.tag].map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-1 rounded text-xs font-medium ${tagColors[tag] || 'bg-gray-100 text-gray-700'}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="min-w-0"><p className="truncate text-sm font-medium text-gray-900">{entry.title}</p>

              {/* Timestamp */}
              <p className="mt-1 font-mono text-xs text-gray-500">{formatTimestamp(entry.logged_at)}</p></div>
            </div>

            {/* Duration */}
            <div className="hidden shrink-0 text-right md:block">
              <p className="font-mono text-sm font-medium text-gray-900">{entry.duration_minutes} min</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

RecentLog.propTypes = { logs: PropTypes.arrayOf(PropTypes.object).isRequired, asOf: PropTypes.string.isRequired, onAdd: PropTypes.func.isRequired };

export default RecentLog;
