import { Control, FieldValues, Path } from 'react-hook-form';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { RequiredLabel } from './RequiredLabel';
import { OptionalLabel } from './OptionalLabel';

interface Props<TFormValues extends FieldValues> {
    name: Path<TFormValues>;
    label: string;
    required?: boolean;
    control: Control<TFormValues>;
}

export const BasicFileInput = <TFormValues extends FieldValues>({
    name,
    label,
    required,
    control,
}: Props<TFormValues>) => {
    return (
        <FormField
            control={control}
            name={name}
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
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                field.onChange(e.target.files?.[0] ?? undefined)
                            }
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
