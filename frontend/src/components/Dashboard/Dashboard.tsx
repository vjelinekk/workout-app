'use client';

import React from 'react';
import Link from 'next/link';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Dumbbell, Calendar, Layout, CheckSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

export const Dashboard = () => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.dashboardPage);

    const tiles = [
        {
            id: 'exercises',
            title: t('exercises'),
            description: t('exercisesSubtitle'),
            href: '/exercises',
            icon: <Dumbbell className="w-6 h-6" />,
        },
        {
            id: 'plans',
            title: t('workoutSessionPlans'),
            description: t('workoutSessionPlansSubtitle'),
            href: '/plans',
            icon: <Calendar className="w-6 h-6" />,
        },
        {
            id: 'splits',
            title: t('trainingSplits'),
            description: t('trainingSplitsSubtitle'),
            href: '/splits',
            icon: <Layout className="w-6 h-6" />,
        },
        {
            id: 'logging',
            title: t('sessionLogging'),
            description: t('sessionLoggingSubtitle'),
            href: '/session-logging',
            icon: <CheckSquare className="w-6 h-6" />,
        },
    ];

    return (
        <div className="w-full max-w-screen-xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {tiles.map((t) => (
                    <Link key={t.id} href={t.href} className="block h-full">
                        <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center rounded-md bg-muted p-3 text-muted-foreground">
                                        {t.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <CardTitle className="text-lg font-medium">
                                            {t.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-muted-foreground">
                                            {t.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};
