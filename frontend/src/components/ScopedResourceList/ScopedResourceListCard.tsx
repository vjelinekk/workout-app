import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Spinner } from '../ui/icons/spinner';
import { useState } from 'react';
import { ApiErrorResponse } from '@/types/api';
import Link from 'next/link';
import { DeleteConfirm } from './DeleteConfirm';
import { useTranslations } from 'next-intl';
import { TRANSLATION_SECTION_KEYS } from '@/constants/locale';

interface Props<T extends { id: number; name: string }> {
    title: string;
    entities?: T[];
    isLoading: boolean;
    error: ApiErrorResponse | null;
    errorLabel: string;
    emptyMessage: string;
    detailLink: string;
    addDeleteButton?: boolean;
    handleDelete?: (id: number) => void;
}

export const ScopedResourceListCard = <T extends { id: number; name: string }>({
    title,
    entities,
    isLoading,
    error,
    errorLabel,
    emptyMessage,
    detailLink,
    addDeleteButton = false,
    handleDelete,
}: Props<T>) => {
    const t = useTranslations(TRANSLATION_SECTION_KEYS.common);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
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
                                            <Link
                                                href={`/${detailLink}/${e.id}`}
                                            >
                                                {e.name}
                                            </Link>

                                            {addDeleteButton &&
                                                handleDelete && (
                                                    <DeleteConfirm
                                                        title={t(
                                                            'doYouWantToDelete',
                                                            { name: e.name },
                                                        )}
                                                        description={t(
                                                            'deleteDescription',
                                                        )}
                                                        onConfirm={() =>
                                                            handleDelete(e.id)
                                                        }
                                                    />
                                                )}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </CardContent>
                )}
            </Card>
        </>
    );
};
