import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { UpdateTrainingSplitForm } from '@/components/TrainingSplits/TrainingSplitForm/UpdateTrainingSplitForm';

interface Props {
    params: { id: number };
}

export default async function TrainingSplitDetailPage({ params }: Props) {
    /* eslint-disable-next-line @typescript-eslint/await-thenable */
    const id = (await params).id;

    return (
        <ProtectedRoute>
            <UpdateTrainingSplitForm id={id} />
        </ProtectedRoute>
    );
}
