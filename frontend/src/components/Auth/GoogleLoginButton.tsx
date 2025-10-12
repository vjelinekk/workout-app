import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { GoogleIcon } from '../GoogleIcon/GoogleIcon';

export const GoogleLoginButton = () => {
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
                'Opening Google login...'
            ) : (
                <>
                    <GoogleIcon />
                    Sign in with Google
                </>
            )}
        </Button>
    );
};
