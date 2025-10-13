'use client';

import { Component, ReactNode } from 'react';
import { Button } from '../ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    title: string;
    description: string;
    tryAgainText: string;
    onTryAgain?: () => void;
    showErrorDetails?: boolean;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log to error tracking service (e.g., Sentry)
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleTryAgain = () => {
        if (this.props.onTryAgain) {
            this.props.onTryAgain();
        } else {
            this.setState({ hasError: false });
        }
    };

    render() {
        if (this.state.hasError) {
            // If a custom fallback is provided, use it
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const {
                title,
                description,
                tryAgainText,
                showErrorDetails = false,
            } = this.props;

            return (
                <div className="flex items-center justify-center min-h-screen p-4 bg-background">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-2xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {showErrorDetails && this.state.error && (
                                <Alert variant="destructive">
                                    <AlertTitle>Error Details</AlertTitle>
                                    <AlertDescription>
                                        <code className="text-xs break-all">
                                            {this.state.error.message}
                                        </code>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>

                        <CardFooter>
                            <Button
                                onClick={this.handleTryAgain}
                                className="w-full"
                            >
                                {tryAgainText}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
