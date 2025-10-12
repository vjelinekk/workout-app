import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { GoogleIcon } from '../GoogleIcon/GoogleIcon';
import { useTranslations } from 'next-intl';
import { Spinner } from '../ui/icons/spinner';
import { SECTION_KEYS } from '@/constants/locale';

export const GoogleLoginButton = () => {
    const t = useTranslations(SECTION_KEYS.loginPage);
    const { loginWithGoogle, isGoogleLoading } = useAuth();

    const handleGoogleLogin = () => {
        loginWithGoogle();
    };

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
        >
            {isGoogleLoading ? (
                <Spinner />
            ) : (
                <>
                    <GoogleIcon />
                    {t('signInWithGoogle')}
                </>
            )}
        </Button>
    );
};
