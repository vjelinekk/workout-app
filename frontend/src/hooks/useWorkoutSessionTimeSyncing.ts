import { WorkoutSession } from "@/types/workoutSession";
import { useEffect, useState } from "react";
import { useSyncWorkoutSessionTime } from "./useWorkoutSessions";
import { DEFAULT_SYNC_INTERVAL_MS } from "@/constants/workoutSession";

export const useWorkoutSessionTimeSyncing = (workoutSession: WorkoutSession) => {
    const [elapsedTime, setElapsedTime] = useState(workoutSession.durationSeconds || 0);
    const [isPaused, setIsPaused] = useState(false)
    const { mutate: syncTime } = useSyncWorkoutSessionTime();

    // Timer effect
    useEffect(() => {
        if (isPaused) return

        const interval = setInterval(() => {
            setElapsedTime((prev) => prev + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [isPaused])

    // Sync time with backend effect
    useEffect(() => {
        // Change every DEFAULT_SYNC_INTERVAL_MS milliseconds
        const interval = setInterval(() => {
            syncTime();
        }, DEFAULT_SYNC_INTERVAL_MS);

        return () => clearInterval(interval);
    }, []);

    // Format time as HH:MM:SS
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    return {
        elapsedTime,
        isPaused,
        setIsPaused,
        formatTime,
    }
}