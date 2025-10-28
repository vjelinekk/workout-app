'use client';

import { useUser } from '@/hooks/useUsers';
import { Profile } from './Profile';
import { Spinner } from '../ui/icons/spinner';
import { BasicFormAlert } from '../BasicForm/BasicFormAlert';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

interface Props {
    id: number;
}

export const ProfileWrapper = ({ id }: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.profilePage);
    const { data: user, isLoading, isError, error } = useUser(id);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Spinner />
            </div>
        );
    }

    if (isError || !user) {
        return (
            <BasicFormAlert
                title={t('errorOccurred')}
                description={error?.message || t('unknownError')}
                variant="destructive"
                isDismissible={false}
                autoDismiss={false}
                show={true}
            />
        );
    }

    return (
        <Profile
            firstName={user.firstName}
            lastName={user.lastName}
            nickname={user.nickname}
            roles={user.roles}
        />
    );
};
