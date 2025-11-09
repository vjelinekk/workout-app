import { SessionLoggingData } from "@/types/workoutSession";
import { useDebouncedCallback } from "@/utils/debounce";
import { useEffect, useState } from "react";
import { useFinishWorkoutSession, useLogSessionProgress } from "./useWorkoutSessions";
import { DEBOUNCE_DELAY_MS, DEFAULT_SYNC_INTERVAL_MS } from "@/constants/workoutSession";
import { getDraftFromStorage, removeDraftFromStorage, saveDraftToStorage } from "@/utils/workoutSessionAutosave";

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

    // Use the new React-compatible debounce hook with proper dependency tracking
    const debouncedSync = useDebouncedCallback(
        (id: number, progressData: SessionLoggingData) => {
            logSessionProgress({ id, progressData });
        },
        DEBOUNCE_DELAY_MS,
        [logSessionProgress] // ✅ Now properly included!
    );

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

            // Save immediately to localStorage with error handling
            saveDraftToStorage(`workout_session_${workoutSessionId}_draft`, newData);

            // Sync to backend (debounced)
            debouncedSync(workoutSessionId, newData);

            return newData;
        });
    }

    // Periodic sync in case something is still unsaved
    useEffect(() => {
        const interval = setInterval(() => {
            const draft = getDraftFromStorage(`workout_session_${workoutSessionId}_draft`);
            if (!draft) {
                return;
            }

            try {
                const parsedData = JSON.parse(draft);
                logSessionProgress({ id: workoutSessionId, progressData: parsedData });
            } catch (error) {
                console.warn(`[Autosave] Failed to parse draft data:`, error);
            }
        }, syncIntervalMs);

        return () => clearInterval(interval);
    }, [workoutSessionId, syncIntervalMs, logSessionProgress]);

    // Load initial draft from localStorage if present
    useEffect(() => {
        const draft = getDraftFromStorage(`workout_session_${workoutSessionId}_draft`);
        if (draft) {
            try {
                setSessionData(JSON.parse(draft));
            } catch (error) {
                console.warn(`[Autosave] Failed to parse initial draft:`, error);
            }
        }
    }, [workoutSessionId]);

    // Expose helper to mark workout finished
    const finishWorkout = async () => {
        const draft = getDraftFromStorage(`workout_session_${workoutSessionId}_draft`);
        if (draft) {
            try {
                const parsedData = JSON.parse(draft);
                logSessionProgress({ id: workoutSessionId, progressData: parsedData });
            } catch (error) {
                console.warn(`[Autosave] Failed to parse draft on finish:`, error);
            }
            removeDraftFromStorage(`workout_session_${workoutSessionId}_draft`);
        }

        finishWorkoutSession({ workoutSessionId, progressData: sessionData });
    };

    return {
        sessionData,
        handleInputChange,
        finishWorkout,
    };
}