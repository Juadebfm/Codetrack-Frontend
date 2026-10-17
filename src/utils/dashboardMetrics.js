const DAY_MS = 24 * 60 * 60 * 1000;

const dayKey = (value) => new Date(value).toISOString().slice(0, 10);

export function getDashboardMetrics(logs, asOfValue) {
  const asOf = new Date(asOfValue);
  const asOfDay = new Date(`${dayKey(asOf)}T00:00:00Z`);
  const loggedDays = new Set(logs.map((log) => dayKey(log.logged_at)));
  const monthPrefix = dayKey(asOf).slice(0, 7);
  const daysThisMonth = [...loggedDays].filter((day) => day.startsWith(monthPrefix)).length;

  const weekday = asOfDay.getUTCDay();
  const daysSinceMonday = (weekday + 6) % 7;
  const weekStart = new Date(asOfDay.getTime() - daysSinceMonday * DAY_MS);
  const weekMinutes = logs.reduce((total, log) => {
    const date = new Date(log.logged_at);
    return date >= weekStart && date <= asOf ? total + log.duration_minutes : total;
  }, 0);
  const previousWeekStart = new Date(weekStart.getTime() - (7 * DAY_MS));
  const previousWeekMinutes = logs.reduce((total, log) => {
    const date = new Date(log.logged_at);
    return date >= previousWeekStart && date < weekStart ? total + log.duration_minutes : total;
  }, 0);

  let streak = 0;
  let cursor = new Date(asOfDay);
  if (!loggedDays.has(dayKey(cursor))) cursor = new Date(cursor.getTime() - DAY_MS);
  while (loggedDays.has(dayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }

  let personalBest = 0;
  let runningStreak = 0;
  const sortedDays = [...loggedDays].sort();
  sortedDays.forEach((day, index) => {
    const previousDay = index > 0 ? new Date(`${sortedDays[index - 1]}T00:00:00Z`) : null;
    const currentDay = new Date(`${day}T00:00:00Z`);
    runningStreak = previousDay && currentDay - previousDay === DAY_MS ? runningStreak + 1 : 1;
    personalBest = Math.max(personalBest, runningStreak);
  });

  return {
    streak,
    personalBest,
    daysThisMonth,
    hoursThisWeek: (weekMinutes / 60).toFixed(1),
    weeklyDeltaHours: ((weekMinutes - previousWeekMinutes) / 60).toFixed(1),
    daysElapsedInMonth: asOf.getUTCDate(),
  };
}

export function getDailyMinutes(logs, endValue, numberOfDays) {
  const end = new Date(`${dayKey(endValue)}T00:00:00Z`);
  const totals = new Map();
  logs.forEach((log) => {
    const key = dayKey(log.logged_at);
    totals.set(key, (totals.get(key) || 0) + log.duration_minutes);
  });

  return Array.from({ length: numberOfDays }, (_, index) => {
    const date = new Date(end.getTime() - (numberOfDays - index - 1) * DAY_MS);
    const key = dayKey(date);
    return { date: key, minutes: totals.get(key) || 0 };
  });
}
