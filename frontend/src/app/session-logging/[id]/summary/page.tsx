import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { SessionLoggingSummaryWrapper } from '@/components/SessionLogging/SessionLoggingSummaryWrapper';

interface Props {
    params: { id: number };
}

export default async function SessionLoggingSummaryPage({ params }: Props) {
    /* eslint-disable-next-line @typescript-eslint/await-thenable */
    const id = (await params).id;

    return (
        <ProtectedRoute>
            <SessionLoggingSummaryWrapper workoutSessionId={id} />
        </ProtectedRoute>
    );
}
