interface Props {
    label: string;
}

export const RequiredLabel = ({ label }: Props) => {
    return (
        <>
            {label} <span className="text-destructive">*</span>
        </>
    );
};
