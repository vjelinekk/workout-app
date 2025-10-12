import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Spinner } from '../ui/icons/spinner';
import { useState } from 'react';
import { ApiErrorResponse } from '@/types/api';

interface Props<T extends { id: number; name: string }> {
    title: string;
    entities?: T[];
    isLoading: boolean;
    error: ApiErrorResponse | null;
    errorLabel: string;
    emptyMessage: string;
}

export const ScopedResourceListCard = <T extends { id: number; name: string }>({
    title,
    entities,
    isLoading,
    error,
    errorLabel,
    emptyMessage,
}: Props<T>) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Card>
            <CardHeader
                className="flex items-center justify-between"
                onClick={() => setCollapsed((s) => !s)}
            >
                <CardTitle>{title}</CardTitle>
                <Button variant="ghost" className="-mr-2">
                    {collapsed ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronUp className="w-4 h-4" />
                    )}
                </Button>
            </CardHeader>
            {!collapsed && (
                <CardContent>
                    {error && (
                        <p className="text-sm text-red-600">
                            {errorLabel}: {error.message.message}
                        </p>
                    )}
                    {isLoading && <Spinner />}
                    {entities && entities.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {emptyMessage}
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {entities &&
                                entities.map((e) => (
                                    <li
                                        key={e.id}
                                        className="flex items-center justify-between"
                                    >
                                        <span>{e.name}</span>
                                    </li>
                                ))}
                        </ul>
                    )}
                </CardContent>
            )}
        </Card>
    );
};
