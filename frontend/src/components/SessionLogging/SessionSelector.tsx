import Link from 'next/link';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { WorkoutSessionPlan } from '@/types/workoutSessionPlan';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

interface SessionOption {
    key: string;
    day: { name: string; shortName: string; dayOfWeek: number };
    workoutSessionPlan: WorkoutSessionPlan;
}

interface Props {
    currentSessionKey: string | undefined;
    setCurrentSessionKey: (k: string) => void;
    availableSessions: SessionOption[];
    currentSession?: WorkoutSessionPlan | undefined | null;
}

export const SessionSelector = ({
    currentSessionKey,
    setCurrentSessionKey,
    availableSessions,
    currentSession,
}: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.sessionLoggingPage);

    return (
        <div className="space-y-2">
            <div>
                <label htmlFor="session-select" className="text-sm font-medium">
                    {t('todayWorkout')}
                </label>
            </div>

            <div className="flex items-center gap-2">
                <Select
                    value={currentSessionKey}
                    onValueChange={setCurrentSessionKey}
                >
                    <SelectTrigger id="session-select">
                        <SelectValue
                            placeholder={t('selectWorkoutSessionPlaceholder')}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {availableSessions.map((session) => (
                            <SelectItem key={session.key} value={session.key}>
                                {session.workoutSessionPlan.name} (
                                {session.day.name})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {currentSession && (
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="shrink-0"
                        aria-label={t('openPlanNewTab')}
                    >
                        <Link
                            href={`/plans/${currentSession.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
};
