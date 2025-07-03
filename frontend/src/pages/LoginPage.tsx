import {
    type ActionFunctionArgs,
    Link,
    redirect,
    useActionData,
    useLocation,
    useNavigation,
    useSubmit
} from "react-router";
import {authProvider} from "../auth.ts";
import * as Yup from "yup";
import {FormProvider, useForm, useFormContext} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {type HTMLInputTypeAttribute, useEffect} from "react";
import {LoadingSpinner} from "../components/LoadingSpinner.tsx";

export async function action({request}: ActionFunctionArgs) {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const redirectTo = formData.get("redirectTo") as string;

    const result = await authProvider.signIn(username, password);

    if (result.success) {
        return redirect(redirectTo);
    }
    return {
        error: result.error
    }
}

export async function loader() {
    if (await authProvider.isAuthenticated()) return redirect("/");
}

export type AuthForm = {
    username: string,
    password: string,
}

export function AuthInput(props: { name: keyof AuthForm, label: string, type: HTMLInputTypeAttribute }) {
    const {register, formState: {errors}} = useFormContext<AuthForm>();

    return <>
        {errors[props.name]?.message &&
            <label htmlFor={props.name}
                   className="block text-sm font-medium text-red-400">{errors[props.name]?.message}
            </label>}
        {!errors[props.name]?.message &&
            <label htmlFor="username"
                   className="block text-sm font-medium text-gray-700">{props.label}</label>}
        <input {...register(props.name)} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-500" type={props.type}/>
    </>;
}

export function LoadingOverlay() {
    return <div
        className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl z-20">
        <LoadingSpinner/>
    </div>;
}

export default function LoginPage() {
    const submit = useSubmit();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const redirectTo = params.get("redirectTo") || "/";
    const actionData = useActionData() as { error: string } | undefined;

    const validationSchema = Yup.object({
        username: Yup.string().required("Username is required"),
        password: Yup.string().required("Password is required"),
    });

    const methods = useForm<AuthForm>({
        resolver: yupResolver(validationSchema),
        mode: "onBlur",
    });

    useEffect(() => {
        methods.setError("username", {message: actionData?.error});
    }, [actionData]);


    const navigation = useNavigation();
    const isLoggingIn = navigation.formData?.get("username") != null;

    const onSubmit = async (data: AuthForm) => {
        await submit({...data, redirectTo}, {method: "post"});
    }

    return (
        <FormProvider {...methods}>
            <div className="flex items-center justify-center m-auto min-w-xs max-w-sm relative">
                <form className="w-full p-6 bg-white rounded-2xl shadow-md space-y-5"
                      onSubmit={methods.handleSubmit(onSubmit)}>
                    <h2 className="text-2xl font-semibold text-center">Login</h2>
                    <div>
                        <AuthInput name="username" label="Username" type="text"/>
                    </div>
                    <div>
                        <AuthInput name={"password"} label={"Password"} type={"password"}/>
                    </div>
                    <button type="submit" className="w-full py-2 bg-blue-600 text-white
                    rounded-lg hover:bg-blue-700 transition-colors ease-in duration-200"
                            disabled={isLoggingIn}>{isLoggingIn ? "Logging in..." : "Log In"}
                    </button>

                    <p className="text-sm text-center text-gray-600">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-blue-600 hover:underline">
                            Sign up
                        </Link>
                    </p>
                </form>
                {isLoggingIn && <LoadingOverlay/>}
            </div>
        </FormProvider>
    );
}
