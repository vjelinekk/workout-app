import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/auth';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

interface Props {
    nickname: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
}

export const Profile = ({ nickname, firstName, lastName, roles }: Props) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.profilePage);
    const tRoles = useTranslations(TRANSLATION_SECTION_KEYS.common);

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <Card className="border-border">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-medium">
                        {t('title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            {t('nickname')}
                        </p>
                        <p className="text-base font-medium">{nickname}</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            {t('firstName')}
                        </p>
                        <p className="text-base font-medium">{firstName}</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            {t('lastName')}
                        </p>
                        <p className="text-base font-medium">{lastName}</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            {t('roles')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {roles.map((role, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-sm"
                                >
                                    {tRoles(`roles.${String(role)}`)}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
