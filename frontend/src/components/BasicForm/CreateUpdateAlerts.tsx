import { BasicFormAlert } from '@/components/BasicForm/BasicFormAlert';

interface Props {
    creationFailedTitle: string;
    updateFailedTitle: string;
    creationSuccessTitle: string;
    updateSuccessTitle: string;
    createError?: string;
    updateError?: string;
    isErrorCreate: boolean;
    isErrorUpdate: boolean;
    isSuccessCreate: boolean;
    isSuccessUpdate: boolean;
}

export const CreateUpdateAlerts = ({
    creationFailedTitle,
    updateFailedTitle,
    creationSuccessTitle,
    updateSuccessTitle,
    createError,
    updateError,
    isErrorCreate,
    isErrorUpdate,
    isSuccessCreate,
    isSuccessUpdate,
}: Props) => {
    return (
        <>
            <BasicFormAlert
                title={creationFailedTitle}
                show={isErrorCreate}
                autoDismiss={false}
                variant="destructive"
                description={createError}
            />

            <BasicFormAlert
                title={updateFailedTitle}
                show={isErrorUpdate}
                autoDismiss={false}
                variant="destructive"
                description={updateError}
            />

            <BasicFormAlert
                title={creationSuccessTitle}
                show={isSuccessCreate}
                variant="default"
            />

            <BasicFormAlert
                title={updateSuccessTitle}
                show={isSuccessUpdate}
                variant="default"
            />
        </>
    );
};
