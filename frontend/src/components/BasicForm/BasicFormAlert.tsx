import { AlertCircleIcon, CheckCircle2Icon, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useBasicFormAlertDismiss } from '@/hooks/useBasicFormAlertDismiss';

interface Props {
    title: string;
    show: boolean;
    autoDismiss?: boolean;
    variant?: 'default' | 'destructive';
    description?: string;
    dismissCallback?: () => void;
    isDismissible?: boolean;
}

export const BasicFormAlert = ({
    title,
    show,
    autoDismiss = true,
    variant = 'destructive',
    description,
    dismissCallback,
    isDismissible = true,
}: Props) => {
    const { showAlert, setShowAlert, timerRef } = useBasicFormAlertDismiss(
        show,
        autoDismiss,
    );

    const handleDismiss = () => {
        if (!isDismissible) {
            return;
        }

        setShowAlert(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        dismissCallback?.();
    };

    return (
        showAlert && (
            <div className="mb-4">
                <Alert variant={variant} onClick={handleDismiss}>
                    {variant === 'destructive' ? (
                        <AlertCircleIcon className="h-4 w-4" />
                    ) : (
                        <CheckCircle2Icon color="green" className="h-4 w-4" />
                    )}
                    <AlertTitle>{title}</AlertTitle>
                    {description && (
                        <AlertDescription>{description}</AlertDescription>
                    )}
                    {!autoDismiss && isDismissible && (
                        <X
                            className="h-4 w-4 cursor-pointer absolute top-2 right-2"
                            onClick={handleDismiss}
                        />
                    )}
                </Alert>
            </div>
        )
    );
};
