import { useMemo, useState } from 'react';
import { Flame, Calendar, Clock, X } from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import BottomNavigation from '../components/dashboard/BottomNavigation';
import MetricCard from '../components/MetricCard';
import Heatmap from '../components/dashboard/Heatmap';
import RecentLog from '../components/dashboard/RecentLog';
import Goals from '../components/dashboard/Goals';
import Activity from '../components/dashboard/Activity';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';
import { getDashboardMetrics } from '../utils/dashboardMetrics';

const DashBoardPage = () => {
  const { profiles, learningLogs, goals, dashboardAsOf, addLearningLog } = useDashboard();
  const { currentUser, signOut } = useAuth();
  const [showLogForm, setShowLogForm] = useState(false);
  const [form, setForm] = useState({ title: '', tag: 'react', duration: '20' });
  const profile = profiles.find((item) => item.id === currentUser.id) ?? {
    id: currentUser.id,
    display_name: currentUser.display_name,
    plan: currentUser.plan,
    time_zone: currentUser.time_zone,
  };
  const profileLogs = learningLogs.filter((log) => log.profile_id === profile.id);
  const profileGoals = goals.filter((goal) => goal.profile_id === profile.id);
  const metrics = useMemo(
    () => getDashboardMetrics(profileLogs, dashboardAsOf),
    [dashboardAsOf, profileLogs],
  );

  const submitLog = (event) => {
    event.preventDefault();
    addLearningLog({
      profileId: profile.id,
      title: form.title.trim(),
      tag: form.tag,
      durationMinutes: Number(form.duration),
      loggedAt: dashboardAsOf,
    });
    setForm({ title: '', tag: 'react', duration: '20' });
    setShowLogForm(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5]">
      {/* Sidebar - Hidden on mobile */}
      <DashboardSidebar name={profile.display_name} plan={profile.plan} onSignOut={signOut} />

      {/* Main Content */}
      <main id="top" className="w-full pb-24 md:ml-60 md:w-[calc(100%-15rem)] md:pb-8">
        {/* Header */}
        <DashboardHeader
          name={profile?.display_name || 'Alex'}
          streak={metrics.streak}
          onLog={() => setShowLogForm(true)}
        />

        {/* Page Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
          {/* Metrics Grid - 1 column on mobile, 3 on desktop */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <MetricCard
              icon={Flame}
              label="Current streak"
              value={metrics.streak}
              unit="days"
              helperText={`Personal best: ${metrics.personalBest} days`}
            />
            <MetricCard
              icon={Calendar}
              label="Days logged this month"
              value={metrics.daysThisMonth}
              helperText={`of ${metrics.daysElapsedInMonth} days so far`}
            />
            <MetricCard
              icon={Clock}
              label="Hours this week"
              value={metrics.hoursThisWeek}
              unit="hrs"
              helperText={`${Number(metrics.weeklyDeltaHours) >= 0 ? '+' : ''}${metrics.weeklyDeltaHours} vs last week`}
            />
          </section>

          {/* Heatmap Section */}
          <section id="heatmap" className="scroll-mt-24">
            <Heatmap logs={profileLogs} asOf={dashboardAsOf} />
          </section>

          {/* Bottom Split Layout - 1 column on mobile, 3-column on desktop */}
          <section className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(20rem,5fr)] lg:items-stretch">
            {/* Recent Log - takes full width on mobile, 2 columns on desktop */}
            <div id="recent-log" className="h-full scroll-mt-24">
              <RecentLog logs={profileLogs} asOf={dashboardAsOf} onAdd={() => setShowLogForm(true)} />
            </div>

            {/* Goals and Activity - takes full width on mobile, 1 column on desktop, stacked */}
            <div className="grid h-full grid-rows-[auto_1fr] gap-4 md:gap-6">
              <div id="goals" className="scroll-mt-24"><Goals goals={profileGoals} /></div>
              <div id="activity" className="min-h-0 scroll-mt-24"><Activity logs={profileLogs} asOf={dashboardAsOf} /></div>
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Navigation - Visible on mobile */}
      <BottomNavigation />

      {showLogForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-gray-950/45 p-4" role="presentation" onMouseDown={() => setShowLogForm(false)}>
          <section className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="log-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 id="log-title" className="text-xl font-semibold text-gray-950">Log today</h2>
              <button type="button" onClick={() => setShowLogForm(false)} className="rounded-md p-2 text-gray-500 hover:bg-gray-100" aria-label="Close log form"><X size={20} /></button>
            </div>
            <form onSubmit={submitLog} className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">What did you work on?
                <input required autoFocus value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-gray-700">Skill
                  <select value={form.tag} onChange={(event) => setForm({ ...form, tag: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5"><option>react</option><option>algorithms</option><option>css-grid</option><option>sql</option></select>
                </label>
                <label className="block text-sm font-medium text-gray-700">Minutes
                  <input type="number" min="1" max="1440" required value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5" />
                </label>
              </div>
              <button className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600">Save entry</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default DashBoardPage;
