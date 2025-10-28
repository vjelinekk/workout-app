import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { ProfileWrapper } from '@/components/Profile/ProfileWrapper';

interface Props {
    params: { id: number };
}

export default async function ProfilePage({ params }: Props) {
    /* eslint-disable-next-line @typescript-eslint/await-thenable */
    const id = (await params).id;

    return (
        <ProtectedRoute>
            <ProfileWrapper id={id} />
        </ProtectedRoute>
    );
}
