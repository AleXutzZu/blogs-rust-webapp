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
        error: "Username or password are wrong"
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
                {isLoggingIn && (
                    <div
                        className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl z-20">
                        <svg aria-hidden="true"
                             className="w-16 h-16 animate-spin text-gray-400 fill-blue-600"
                             viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"/>
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"/>
                        </svg>
                    </div>
                )}
            </div>
        </FormProvider>
    );
}
