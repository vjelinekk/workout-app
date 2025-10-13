import { Trash2Icon } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../ui/alert-dialog';

interface Props {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

export const DeleteConfirm = ({
    title,
    description,
    onConfirm,
    onCancel,
}: Props) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Trash2Icon className="w-4 h-4 text-red-600 hover:cursor-pointer" />
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
