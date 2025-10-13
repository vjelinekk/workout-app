import { AlertCircleIcon, CheckCircle2Icon, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useBasicFormAlertDismiss } from '@/hooks/useBasicFormAlertDismiss';

interface Props {
    title: string;
    show: boolean;
    autoDismiss?: boolean;
    variant?: 'default' | 'destructive';
    description?: string;
}

export const BasicFormAlert = ({
    title,
    show,
    autoDismiss = true,
    variant = 'destructive',
    description,
}: Props) => {
    const { showAlert, setShowAlert, timerRef } = useBasicFormAlertDismiss(
        show,
        autoDismiss,
    );

    const handleDismiss = () => {
        setShowAlert(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
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
                    {!autoDismiss && (
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
