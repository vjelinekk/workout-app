import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form';
import { Textarea } from '../ui/textarea';
import { Control, FieldValues, Path } from 'react-hook-form';
import { RequiredLabel } from './RequiredLabel';
import { OptionalLabel } from './OptionalLabel';

interface Props<TFormValues extends FieldValues> {
    name: Path<TFormValues>;
    label: string;
    required?: boolean;
    placeholder?: string;
    control: Control<TFormValues>;
    disabled?: boolean;
    rows?: number;
    layout?: 'vertical' | 'horizontal';
}

export const BasicTextareaField = <TFormValues extends FieldValues>({
    name,
    label,
    required,
    placeholder,
    control,
    disabled = false,
    rows = 4,
    layout = 'vertical',
}: Props<TFormValues>) => {
    return (
        <FormField
            control={control}
            name={name}
            disabled={disabled}
            render={({ field }) => (
                <FormItem
                    className={
                        layout === 'horizontal' ? 'flex items-start gap-2' : ''
                    }
                >
                    <FormLabel
                        className={
                            layout === 'horizontal' ? 'flex-shrink-0 pt-2' : ''
                        }
                    >
                        {required ? (
                            <RequiredLabel label={label} />
                        ) : (
                            <OptionalLabel label={label} />
                        )}
                    </FormLabel>
                    <FormControl>
                        <div>
                            <Textarea
                                placeholder={placeholder}
                                {...field}
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                rows={rows}
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                                {(field.value ?? '').length} characters
                            </div>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
