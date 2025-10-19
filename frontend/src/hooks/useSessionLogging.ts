import { TrainingSplit } from "@/types/trainingSplit";
import { WorkoutSessionPlan } from "@/types/workoutSessionPlan";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useDaysTranslation } from "./useDaysTranslation";

export const useCurrentSession = (activeTrainingSplit: TrainingSplit): {
    currentSession: WorkoutSessionPlan | undefined;
    setCurrentSessionKey: Dispatch<SetStateAction<string>>;
    currentSessionKey: string;
    availableSessions: Array<{
        key: string; // unique key for select
        day: { name: string; shortName: string; dayOfWeek: number };
        workoutSessionPlan: WorkoutSessionPlan;
    }>
} => {
    const { daysOfWeekTranslations } = useDaysTranslation();

    const availableSessions = useMemo(() => {
        if (!activeTrainingSplit?.days) return [];

        return activeTrainingSplit.days
            .map(day => {
                if (!day.workoutSessionPlan) return null;
                return {
                    key: `${day.workoutSessionPlan.id}-${day.dayOfWeek}`,
                    day: {
                        ...daysOfWeekTranslations[day.dayOfWeek],
                        dayOfWeek: day.dayOfWeek,
                    },
                    workoutSessionPlan: day.workoutSessionPlan,
                };
            })
            .filter((s): s is NonNullable<typeof s> => s !== null);
    }, [activeTrainingSplit, daysOfWeekTranslations]);

    // Compute today's day number (1 = Monday, 7 = Sunday)
    const today = useMemo(() => {
        const jsDay = new Date().getDay(); // 0 (Sun) - 6 (Sat)
        return jsDay === 0 ? 7 : jsDay; // Convert to 1-7
    }, []);

    // Default selected session key
    const todaySessionKey = useMemo(() => {
        const todaySession = availableSessions.find(s => s.day.dayOfWeek === today);
        return todaySession?.key ?? '';
    }, [availableSessions, today]);

    const [currentSessionKey, setCurrentSessionKey] = useState(todaySessionKey);

    // Compute the current session based on the selected key
    const currentSession = useMemo(() => {
        return availableSessions.find(s => s.key === currentSessionKey)?.workoutSessionPlan;
    }, [availableSessions, currentSessionKey]);

    // Reset key if availableSessions change (e.g., after loading)
    useEffect(() => {
        if (!availableSessions.find(s => s.key === currentSessionKey)) {
            setCurrentSessionKey(todaySessionKey);
        }
    }, [availableSessions, currentSessionKey, todaySessionKey]);

    return {
        currentSession,
        currentSessionKey,
        setCurrentSessionKey,
        availableSessions,
    };
};
