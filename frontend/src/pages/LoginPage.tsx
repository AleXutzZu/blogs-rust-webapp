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
import {Form, Formik, type FormikProps} from "formik";
import Input from "../components/Input.tsx";
import {useEffect, useRef} from "react";

type AuthForm = {
    username: string,
    password: string,
}

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
        fieldErrors: {
            username: "Username or password are incorrect"
        }
    }
}

export async function loader() {
    if (await authProvider.isAuthenticated()) return redirect("/");
}

export default function LoginPage() {
    const submit = useSubmit();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const redirectTo = params.get("redirectTo") || "/";
    const actionData = useActionData() as { fieldErrors: { username: string } } | undefined;

    const formikRef = useRef<FormikProps<AuthForm> | null>(null);

    useEffect(() => {
        if (actionData?.fieldErrors && formikRef.current) {
            formikRef.current.setErrors(actionData.fieldErrors);
        }
    }, [actionData]);

    const validationSchema = Yup.object<AuthForm>({
        username: Yup.string().required("Username is required"),
        password: Yup.string().required("Password is required"),
    });

    let navigation = useNavigation();
    let isLoggingIn = navigation.formData?.get("username") != null;


    return (
        <Formik initialValues={{username: "", password: ""} as AuthForm} onSubmit={async (values) => {
            await submit({...values, redirectTo}, {method: "post"});
        }} validationSchema={validationSchema}
                innerRef={formikRef}
        >
            {_formik => (
                <div className="flex items-center justify-center m-auto min-w-xs">
                    <Form className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-md space-y-5">
                        <h2 className="text-2xl font-semibold text-center">Login</h2>
                        <div>
                            <Input label="Username" type="text" name="username"
                                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div>
                            <Input label="Password" type="password" name="password"
                                   className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-500"/>
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
                    </Form>
                </div>
            )}
        </Formik>
    );
}
