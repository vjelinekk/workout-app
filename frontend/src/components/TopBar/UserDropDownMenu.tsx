import { Button } from '../ui/button';
import { CircleUser } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { UserRole } from '@/types/auth';

export const UserDropDownMenu = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.topBar);
    const { user, logout } = useAuth();
    const router = useRouter();

    if (!user) {
        return null;
    }

    const handleProfile = () => {
        router.push(`/profile/${user.id}`);
    };

    const handleBecomeTrainer = () => {
        router.push('/become-trainer');
    };

    const handleTrainerApprovals = () => {
        router.push('/admin/trainer-approvals');
    };

    const handleSettings = () => {
        router.push('/settings');
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const renderBecomeTrainer = () => {
        const isTrainerOrAdmin = user.roles.some((role) =>
            [UserRole.TRAINER, UserRole.ADMIN].includes(role),
        );
        return (
            <>
                {!isTrainerOrAdmin && (
                    <DropdownMenuItem onClick={handleBecomeTrainer}>
                        {t('becomeTrainer')}
                    </DropdownMenuItem>
                )}
            </>
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <CircleUser className="w-6 h-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleProfile}>
                    {t('profile')}
                </DropdownMenuItem>
                {renderBecomeTrainer()}
                {user?.roles.includes(UserRole.ADMIN) && (
                    <DropdownMenuItem onClick={handleTrainerApprovals}>
                        {t('trainerApprovals')}
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSettings}>
                    {t('settings')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                    {t('logout')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
