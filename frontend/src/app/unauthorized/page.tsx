import { AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                    </div>
                    <CardTitle className="text-4xl font-bold">403</CardTitle>
                    <CardDescription className="mt-2 text-base">
                        Access Denied
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Unauthorized Access</AlertTitle>
                        <AlertDescription>
                            You don't have permission to access this page. If
                            you believe this is an error, please contact
                            support.
                        </AlertDescription>
                    </Alert>

                    <Link href="/dashboard" className="block w-full">
                        <Button className="w-full" size="lg">
                            <Home className="h-4 w-4" />
                            Go to Dashboard
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
