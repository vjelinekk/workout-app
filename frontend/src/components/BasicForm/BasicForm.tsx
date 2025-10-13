import { FieldValues, UseFormReturn } from 'react-hook-form';
import { Button } from '../ui/button';
import { Form } from '../ui/form';

interface Props<T extends FieldValues> {
    form: UseFormReturn<T>;
    onSubmit: (data: T) => void;
    children: React.ReactNode;
    submitLabel: string;
    submittingLabel: string;
    isViewMode?: boolean;
}

export const BasicForm = <T extends FieldValues>({
    form,
    onSubmit,
    children,
    submitLabel,
    submittingLabel,
    isViewMode,
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

                {isViewMode ? null : (
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting
                            ? submittingLabel
                            : submitLabel}
                    </Button>
                )}
            </form>
        </Form>
    );
};
