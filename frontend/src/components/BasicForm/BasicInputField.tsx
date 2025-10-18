import { HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute } from 'react';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Control, FieldValues, Path } from 'react-hook-form';
import { RequiredLabel } from './RequiredLabel';
import { OptionalLabel } from './OptionalLabel';

interface Props<TFormValues extends FieldValues> {
    name: Path<TFormValues>;
    label: string;
    required?: boolean;
    placeholder?: string;
    type?: HTMLInputTypeAttribute;
    autoComplete?: HTMLInputAutoCompleteAttribute;
    control: Control<TFormValues>;
    disabled?: boolean;
    min?: number;
    max?: number;
    layout?: 'vertical' | 'horizontal';
}

export const BasicInputField = <TFormValues extends FieldValues>({
    name,
    label,
    required,
    placeholder,
    type = 'text',
    autoComplete,
    control,
    disabled = false,
    min,
    max,
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
                        layout === 'horizontal' ? 'flex items-center gap-2' : ''
                    }
                >
                    <FormLabel
                        className={
                            layout === 'horizontal' ? 'flex-shrink-0 mb-0' : ''
                        }
                    >
                        {required ? (
                            <RequiredLabel label={label} />
                        ) : (
                            <OptionalLabel label={label} />
                        )}
                    </FormLabel>
                    <FormControl>
                        <Input
                            type={type}
                            placeholder={placeholder}
                            autoComplete={autoComplete}
                            {...field}
                            value={field.value ?? ''} // <-- key: fallback to empty string
                            onChange={(e) => {
                                if (type === 'number') {
                                    const n = Number(e.target.value);
                                    field.onChange(isNaN(n) ? undefined : n); // pass undefined if empty
                                } else {
                                    field.onChange(e);
                                }
                            }}
                            min={min ? min : undefined}
                            max={max ? max : undefined}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
