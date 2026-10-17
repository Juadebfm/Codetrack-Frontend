import { Flame, Plus } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Brand from '../auth/Brand.jsx';

const DashboardHeader = ({ name, streak, onLog }) => {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setToday(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedDate = dateFormatter.format(today).replace(',', ' ·');
  const firstName = name.split(' ')[0];

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 md:py-4">
        <div className="mb-3 flex items-center justify-between md:hidden">
          <Brand variant="light" />
          <HeaderActions streak={streak} onLog={onLog} />
        </div>
        <div className="-mx-4 mb-3 border-t border-gray-200 md:hidden" aria-hidden="true" />
        {/* Header Layout - Greeting on Left, Actions on Right */}
        <div className="flex items-center justify-between gap-4">
          {/* Greeting Section */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 md:text-lg">Good evening, {firstName}</h1>
            <p className="mt-1 font-mono text-xs text-gray-500 md:text-sm">{formattedDate}</p>
          </div>

          {/* Action Group - Right Side */}
          <div className="hidden md:block"><HeaderActions streak={streak} onLog={onLog} /></div>
        </div>
      </div>
    </header>
  );
};

const HeaderActions = ({ streak, onLog }) => (
  <div className="flex items-center gap-2 md:gap-3">
    <div className="flex whitespace-nowrap items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-2 font-mono text-[11px] font-semibold text-amber-700 md:px-4 md:text-sm">
      <Flame size={15} className="text-orange-500" /><span>{streak}-day streak</span>
    </div>
    <button type="button" onClick={onLog} className="flex whitespace-nowrap items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 md:px-5 md:text-sm">
      <Plus size={16} /><span>Log today</span>
    </button>
  </div>
);

DashboardHeader.propTypes = { name: PropTypes.string.isRequired, streak: PropTypes.number.isRequired, onLog: PropTypes.func.isRequired };
HeaderActions.propTypes = { streak: PropTypes.number.isRequired, onLog: PropTypes.func.isRequired };

export default DashboardHeader;
