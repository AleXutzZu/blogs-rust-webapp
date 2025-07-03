import {type ActionFunctionArgs, Link, redirect, useActionData, useNavigation, useSubmit} from "react-router";
import * as Yup from "yup";
import {type AuthForm, AuthInput, LoadingOverlay} from "./LoginPage.tsx";
import {FormProvider, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useEffect} from "react";
import {authProvider} from "../auth.ts";

export async function action({request}: ActionFunctionArgs) {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const result = await authProvider.signUp(username, password);

    if (result.success) {
        return redirect("/login");
    }
    return {
        error: result.error
    }
}

export default function SignUpPage() {
    const submit = useSubmit();
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

    const onSubmit = async (data: AuthForm) => {
        await submit(data, {method: "post"});
    }

    const navigation = useNavigation();
    const isSigningIn = navigation.formData?.get("username") != null;

    return (
        <FormProvider {...methods}
        >
            <div className="flex items-center justify-center m-auto min-w-xs relative">
                <form className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-md space-y-5"
                      onSubmit={methods.handleSubmit(onSubmit)}>
                    <h2 className="text-2xl font-semibold text-center">Sign Up</h2>
                    <div>
                        <AuthInput label="Username" type="text" name="username"/>
                    </div>
                    <div>
                        <AuthInput label="Password" type="password" name="password"/>
                    </div>

                    <button type="submit" className="w-full py-2 bg-green-600
                        text-white rounded-lg hover:bg-green-700 transition" disabled={isSigningIn}>
                        {isSigningIn ? "Creating account..." : "Sign Up"}
                    </button>

                    <p className="text-sm text-center text-gray-600">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Log in
                        </Link>
                    </p>
                </form>
                {isSigningIn && <LoadingOverlay/>}
            </div>
        </FormProvider>
    );
}
