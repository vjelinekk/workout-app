import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '../ui/form';
import { Control, FieldValues, Path } from 'react-hook-form';
import { RequiredLabel } from './RequiredLabel';
import { OptionalLabel } from './OptionalLabel';
import { ReactNode } from 'react';
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

interface Props<TFormValues extends FieldValues> {
    name: Path<TFormValues>;
    label: string;
    placeholder?: string;
    required?: boolean;
    control: Control<TFormValues>;
    children: ReactNode;
    /** disable the select (useful while loading/error) */
    disabled?: boolean;
    /** coerce incoming select values to a specific type before calling field.onChange */
    valueType?: 'string' | 'number';
    /** css classes to apply to the FormItem container */
    containerClassName?: string;
    /** css classes to apply to the SelectTrigger */
    triggerClassName?: string;
}

export const BasicSelectBox = <TFormValues extends FieldValues>({
    name,
    label,
    placeholder,
    required,
    control,
    children,
    disabled,
    valueType = 'string',
    containerClassName,
    triggerClassName,
}: Props<TFormValues>) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={containerClassName}>
                    <FormLabel>
                        {required ? (
                            <RequiredLabel label={label} />
                        ) : (
                            <OptionalLabel label={label} />
                        )}
                    </FormLabel>
                    <FormControl>
                        <Select
                            onValueChange={(val) => {
                                // coerce value according to requested type
                                if (valueType === 'number') {
                                    const n = Number(val);
                                    field.onChange(
                                        Number.isNaN(n) ? undefined : n,
                                    );
                                } else {
                                    field.onChange(val);
                                }
                            }}
                            value={
                                field.value === undefined ||
                                field.value === null ||
                                field.value === ''
                                    ? ''
                                    : String(field.value)
                            }
                            disabled={disabled}
                        >
                            <SelectTrigger
                                className={triggerClassName || 'w-full'}
                                disabled={disabled}
                            >
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                            <SelectContent>{children}</SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
