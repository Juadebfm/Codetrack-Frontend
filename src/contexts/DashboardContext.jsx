import { createContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { getMockData } from "../services/mockDataService.js";

const DashboardContext = createContext(null);
const DASHBOARD_KEY = 'codetrack-dashboard-data';

const readDashboardData = () => {
    try {
        const stored = JSON.parse(localStorage.getItem(DASHBOARD_KEY));
        return stored && Array.isArray(stored.learningLogs) && Array.isArray(stored.goals) ? stored : null;
    } catch {
        localStorage.removeItem(DASHBOARD_KEY);
        return null;
    }
};

const persistDashboardData = (learningLogs, goals) => {
    localStorage.setItem(DASHBOARD_KEY, JSON.stringify({ learningLogs, goals }));
};

export function DashboardProvider({ children }) {
    const [initialData] = useState(() => readDashboardData());
    const [profiles] = useState(() => getMockData().profiles);
    const [learningLogs, setLearningLogs] = useState(() => initialData?.learningLogs ?? getMockData().learning_logs);
    const [goals, setGoals] = useState(() => initialData?.goals ?? getMockData().goals);
    const [dashboardAsOf] = useState(() => getMockData().simulation_context.dashboard_as_of);

    const value = useMemo(() => ({
        profiles,
        learningLogs,
        goals,
        dashboardAsOf,
        addLearningLog({ profileId, title, tag, durationMinutes, loggedAt = new Date().toISOString() }) {
            const newLog = {
                id: crypto.randomUUID(),
                profile_id: profileId,
                title,
                tag,
                duration_minutes: durationMinutes,
                logged_at: loggedAt,
            };

            setLearningLogs((logs) => {
                const nextLogs = [...logs, newLog];
                persistDashboardData(nextLogs, goals);
                return nextLogs;
            });
            return newLog;
        },
        updateGoal(goalId, updates) {
            setGoals((currentGoals) => {
                const nextGoals = currentGoals.map((goal) => (
                    goal.id === goalId ? { ...goal, ...updates, id: goal.id } : goal
                ));
                persistDashboardData(learningLogs, nextGoals);
                return nextGoals;
            });
        },
    }), [dashboardAsOf, goals, learningLogs, profiles]);

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

DashboardProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { DashboardContext };
