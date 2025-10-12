import { FieldValues, UseFormReturn } from 'react-hook-form';
import { Button } from '../ui/button';
import { Form } from '../ui/form';

interface Props<T extends FieldValues> {
    form: UseFormReturn<T>;
    onSubmit: (data: T) => Promise<void>;
    children: React.ReactNode;
    submitLabel: string;
    submittingLabel: string;
}

export const AuthForm = <T extends FieldValues>({
    form,
    onSubmit,
    children,
    submitLabel,
    submittingLabel,
}: Props<T>) => {
    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    void form.handleSubmit(onSubmit)(e);
                }}
                className="space-y-4"
            >
                {children}

                <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting
                        ? submittingLabel
                        : submitLabel}
                </Button>
            </form>
        </Form>
    );
};
