'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/icons/spinner';
import { useTrainingSplitAssignedToUser } from '@/hooks/useTrainingSplits';
import { Link, Settings } from 'lucide-react';
import { SessionLoggingStart } from './SessionLoggingStart';

export const TrainingSplitAssigned = () => {
    const {
        data: trainingSplit,
        error,
        isLoading,
    } = useTrainingSplitAssignedToUser();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Error Loading Training Split</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600">
                        {error.message.message || 'An unknown error occurred.'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Handle case when no active split
    if (!trainingSplit) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>No Active Training Split</CardTitle>
                    <CardDescription>
                        Please select a training split in your settings to start
                        logging workouts.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/settings">
                            <Settings className="mr-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return <SessionLoggingStart activeTrainingSplit={trainingSplit} />;
};
