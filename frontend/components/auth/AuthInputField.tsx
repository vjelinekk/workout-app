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

interface Props<TFormValues extends FieldValues> {
    name: Path<TFormValues>;
    label: string;
    placeholder?: string;
    type?: HTMLInputTypeAttribute;
    autoComplete?: HTMLInputAutoCompleteAttribute;
    control: Control<TFormValues>;
}

export const AuthInputField = <TFormValues extends FieldValues>({
    name,
    label,
    placeholder,
    type = 'text',
    autoComplete,
    control,
}: Props<TFormValues>) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
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
