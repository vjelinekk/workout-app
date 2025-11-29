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
import { useAnyRole, useRole } from '@/hooks/useRole';

export const UserDropDownMenu = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.topBar);
    const { user, logout } = useAuth();
    const router = useRouter();

    const isTrainerOrAdmin = useAnyRole([UserRole.TRAINER, UserRole.ADMIN]);
    const isAdmin = useRole(UserRole.ADMIN);

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

    const handleApprovals = () => {
        router.push('/admin/approvals');
    };

    const handleAssignTrainingSplit = () => {
        router.push('/assign-training-split');
    };

    const handleRecruitTrainees = () => {
        router.push('/recruit-trainees');
    };

    const handleSettings = () => {
        router.push('/settings');
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
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
                {!isTrainerOrAdmin && (
                    <DropdownMenuItem onClick={handleBecomeTrainer}>
                        {t('becomeTrainer')}
                    </DropdownMenuItem>
                )}
                {isTrainerOrAdmin && (
                    <DropdownMenuItem onClick={handleAssignTrainingSplit}>
                        {t('assignTrainingSplit')}
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem onClick={handleTrainerApprovals}>
                        {t('trainerApprovals')}
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem onClick={handleApprovals}>
                        {t('approvals')}
                    </DropdownMenuItem>
                )}
                {isTrainerOrAdmin && (
                    <DropdownMenuItem onClick={handleRecruitTrainees}>
                        {t('recruitTrainees')}
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
