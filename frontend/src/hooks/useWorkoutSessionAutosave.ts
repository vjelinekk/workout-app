import { SessionLoggingData } from "@/types/workoutSession";
import { debounce } from "@/utils/debounce";
import { useCallback, useEffect, useState } from "react";
import { useFinishWorkoutSession, useLogSessionProgress } from "./useWorkoutSessions";
import { DEBOUNCE_DELAY_MS, DEFAULT_SYNC_INTERVAL_MS } from "@/constants/workoutSession";


interface Args {
    workoutSessionId: number;
    syncIntervalMs?: number;
}

export const useWorkoutSessionAutosave = ({
    workoutSessionId,
    syncIntervalMs = DEFAULT_SYNC_INTERVAL_MS,
}: Args) => {
    const [sessionData, setSessionData] = useState<SessionLoggingData>({})
    const { mutate: logSessionProgress } = useLogSessionProgress();
    const { mutate: finishWorkoutSession } = useFinishWorkoutSession();

    const debouncedSync = useCallback(debounce((data: SessionLoggingData) => {
        logSessionProgress({ id: workoutSessionId, progressData: data });
    }, DEBOUNCE_DELAY_MS), []);

    const handleInputChange = (
        exerciseId: number,
        setIndex: number,
        field: 'reps' | 'weight',
        value: string
    ) => {
        setSessionData(prev => {
            const newExerciseData = {
                ...prev[exerciseId],
                [setIndex]: {
                    ...prev[exerciseId]?.[setIndex],
                    [field]: value === '' ? null : Number(value),
                },
            };

            const newData = { ...prev, [exerciseId]: newExerciseData };

            // Save immediately to localStorage
            localStorage.setItem(`workout_session_${workoutSessionId}_draft`, JSON.stringify(newData));

            // Sync to backend (debounced)
            debouncedSync(newData);

            return newData;
        });
    }

    // Periodic sync in case something is still unsaved
    useEffect(() => {
        const interval = setInterval(() => {
            const draft = localStorage.getItem(`workout_session_${workoutSessionId}_draft`);
            if (!draft) {
                return;
            }

            logSessionProgress({ id: workoutSessionId, progressData: JSON.parse(draft) });
        }, syncIntervalMs);

        return () => clearInterval(interval);
    }, [workoutSessionId, syncIntervalMs]);

    // Load initial draft from localStorage if present
    useEffect(() => {
        const draft = localStorage.getItem(`workout_session_${workoutSessionId}_draft`);
        if (draft) {
            setSessionData(JSON.parse(draft));
        }
    }, [workoutSessionId]);

    // Expose helper to mark workout finished
    const finishWorkout = async () => {
        const draft = localStorage.getItem(`workout_session_${workoutSessionId}_draft`);
        if (draft) {
            logSessionProgress({ id: workoutSessionId, progressData: JSON.parse(draft) });
            localStorage.removeItem(`workout_session_${workoutSessionId}_draft`);
        }

        finishWorkoutSession({ workoutSessionId, progressData: sessionData });
    };

    return {
        sessionData,
        handleInputChange,
        finishWorkout,
    };
}