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
}: Props<TFormValues>) => {
    return (
        <FormField
            control={control}
            name={name}
            disabled={disabled}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>
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
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
