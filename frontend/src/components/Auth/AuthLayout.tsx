import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card';

interface Props {
    title: string;
    children: React.ReactNode;
    description?: string;
}

export const AuthLayout = ({ title, children, description }: Props) => {
    return (
        <div className="flex min-h-[calc(100vh-20rem)] items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        {title}
                    </CardTitle>
                    {description && (
                        <CardDescription className="text-center">
                            {description}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">{children}</CardContent>
            </Card>
        </div>
    );
};
