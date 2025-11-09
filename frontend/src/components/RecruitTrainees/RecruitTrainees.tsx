'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, UserPlus, User } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { UserRole } from '@/types/auth';
import { Spinner } from '../ui/icons/spinner';
import { useSendTrainerRequest } from '@/hooks/useTrainerTrainees';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

export const RecruitTrainees = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.recruitTraineesPage);
    const [searchQuery, setSearchQuery] = useState('');
    const {
        data: trainees,
        isLoading: isLoadingTrainees,
        error: errorTrainees,
    } = useUsers(false, [UserRole.TRAINEE], true);
    const { mutate: sendTrainerRequest } = useSendTrainerRequest();

    const filteredTrainees = useMemo(() => {
        if (!trainees) return [];

        if (!searchQuery) return trainees;

        return trainees.filter((trainee) => {
            const query = searchQuery.toLowerCase();

            const fullName =
                `${trainee.firstName} ${trainee.lastName}`.toLowerCase();

            return (
                trainee.firstName.toLowerCase().includes(query) ||
                trainee.lastName.toLowerCase().includes(query) ||
                fullName.includes(query) ||
                trainee.nickname.toLowerCase().includes(query) ||
                trainee.email.toLowerCase().includes(query)
            );
        });
    }, [searchQuery, trainees]);

    const handleSendRequest = (traineeId: number) => {
        sendTrainerRequest({ traineeId: traineeId });
    };

    if (isLoadingTrainees) {
        return (
            <div className="flex justify-center items-center py-8">
                <Spinner />
            </div>
        );
    }

    if (errorTrainees) {
        return (
            <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
                <Card className="p-8 text-center space-y-4">
                    <p className="text-destructive font-semibold">
                        {t('failedToLoad')}
                    </p>
                    <p className="text-muted-foreground text-sm">
                        {errorTrainees.message}
                    </p>
                    <Button onClick={() => window.location.reload()}>
                        {t('tryAgain')}
                    </Button>
                </Card>
            </div>
        );
    }

    if (!trainees) {
        return (
            <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                        {t('noTraineesFound')}
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>

                {/* Search Field */}
                <div className="w-full">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Results count */}
                <div className="text-sm text-muted-foreground">
                    {t('showingCount', {
                        count: filteredTrainees.length,
                        total: trainees.length,
                    })}
                </div>

                {/* Trainees List */}
                <div className="grid gap-3 sm:gap-4">
                    {filteredTrainees.length > 0 ? (
                        filteredTrainees.map((trainee) => {
                            return (
                                <Card
                                    key={trainee.id}
                                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                                >
                                    {/* Trainee Info */}
                                    <div className="flex gap-4">
                                        <User className="h-12 w-12 text-muted-foreground" />
                                        <div className="flex flex-col gap-1">
                                            <h3 className="font-semibold text-foreground">
                                                {trainee.firstName}{' '}
                                                {trainee.lastName}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {trainee.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        onClick={() =>
                                            handleSendRequest(trainee.id)
                                        }
                                        className="w-full sm:w-auto gap-2"
                                    >
                                        <>
                                            <UserPlus className="h-4 w-4" />
                                            {t('sendRequest')}
                                        </>
                                    </Button>
                                </Card>
                            );
                        })
                    ) : (
                        <Card className="p-8 text-center">
                            <p className="text-muted-foreground">
                                {t('noTraineesMatchingSearch')}
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </main>
    );
};
