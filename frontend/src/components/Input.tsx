import type {ReactNode} from "react";
import {useField} from "formik";

type Props = {
    className?: string,
    placeholder?: string,
    disabled?: boolean,
    children?: ReactNode,
    label: string,
    type: string,
    name: string,
}

const Input = ({label, children, ...props}: Props) => {
    const [field, meta] = useField({...props})

    const labelErrorClasses: string = "block text-sm font-medium text-red-500";

    return (
        <>
            {meta.touched && meta.error ?
                <label htmlFor={props.name}
                       className={labelErrorClasses}>{meta.error}</label>
                :
                <label htmlFor={props.name}
                       className="block text-sm font-medium text-gray-700">{label}</label>}
            {children &&
                <div className="flex space-x-1.5">
                    <input {...field} {...props}/>
                    {children}
                </div>}
            {!children && <input {...field} {...props}/>}
        </>
    )
}
export default Input;