import { Control, FieldValues, Path } from 'react-hook-form';
import { Checkbox } from '../ui/checkbox';
import {
    FormField,
    FormItem,
    FormControl,
    FormLabel,
    FormMessage,
} from '../ui/form';
import { RequiredLabel } from './RequiredLabel';
import { OptionalLabel } from './OptionalLabel';

interface Props<TFormValues extends FieldValues> {
    name: Path<TFormValues>;
    label: string;
    required?: boolean;
    control: Control<TFormValues>;
    disabled?: boolean;
}

export const BasicCheckbox = <TFormValues extends FieldValues>({
    name,
    label,
    required,
    control,
    disabled = false,
}: Props<TFormValues>) => {
    return (
        <FormField
            control={control}
            name={name}
            disabled={disabled}
            render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                    <FormControl>
                        <Checkbox
                            checked={!!field.value}
                            onCheckedChange={(val) => field.onChange(!!val)}
                            disabled={disabled}
                        />
                    </FormControl>
                    <FormLabel>
                        {required ? (
                            <RequiredLabel label={label} />
                        ) : (
                            <OptionalLabel label={label} />
                        )}
                    </FormLabel>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
