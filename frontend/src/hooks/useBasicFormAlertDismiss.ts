import { useRef, useState, useEffect } from "react";

export const useBasicFormAlertDismiss = (
    show: boolean,
    autoDismiss: boolean
) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showAlert, setShowAlert] = useState<boolean>(false);

    useEffect(() => {
        if (autoDismiss) return;

        setShowAlert(show);
    }, [autoDismiss, show, setShowAlert]);

    useEffect(() => {
        if (!autoDismiss || !show) return;

        setShowAlert(true);

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            setShowAlert(false);
        }, 3000);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [autoDismiss, show, setShowAlert]);

    return { showAlert, setShowAlert, timerRef };
}