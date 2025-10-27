import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '../ui/collapsible';
import { Badge } from '../ui/badge';
import { ChevronDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';
import { WorkoutSessionPlanExercise } from '@/types/workoutSessionPlan';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

interface Props {
    exercise: WorkoutSessionPlanExercise;
    index: number;
}

export const SessionExerciseItem = ({ exercise, index }: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.sessionLoggingPage);

    return (
        <Collapsible
            key={exercise.id}
            className="flex flex-col gap-1 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
            <CollapsibleTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <p className="font-medium truncate flex-1">
                        {exercise.exercise?.name}
                    </p>
                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="ml-10 mt-1 text-sm text-muted-foreground space-y-1">
                <Table>
                    <TableBody>
                        {exercise.plannedRepsPerSet.map((r, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    {t('set', { setNumber: i + 1 })}
                                </TableCell>
                                <TableCell style={{ textAlign: 'right' }}>
                                    {r} {t('reps')}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CollapsibleContent>
        </Collapsible>
    );
};
