import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { SessionLoggingRunningWrapper } from '@/components/SessionLogging/SessionLoggingRunningWrapper';

interface Props {
    params: { id: number };
}

export default async function SessionLoggingDetailPage({ params }: Props) {
    /* eslint-disable-next-line @typescript-eslint/await-thenable */
    const id = (await params).id;

    return (
        <ProtectedRoute>
            <SessionLoggingRunningWrapper workoutSessionId={id} />
        </ProtectedRoute>
    );
}
