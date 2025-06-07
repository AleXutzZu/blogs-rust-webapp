import {type ActionFunctionArgs, Link, redirect, useSubmit} from "react-router";
import {authProvider} from "../auth.ts";
import * as Yup from "yup";
import {Form, Formik} from "formik";
import Input from "../components/Input.tsx";

export async function action({request}: ActionFunctionArgs) {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const result = await authProvider.signIn(username, password);

    if (result.success) {
        //TODO redirect back to page
        return redirect("/")
    }
    console.log(result.error);
    return {
        error: "Invalid login attempt"
    }
}

export async function loader() {
    if (authProvider.isAuthenticated()) return redirect("/");
}

export default function LoginPage() {
    const submit = useSubmit();

    const validationSchema = Yup.object({
        username: Yup.string().required(),
        password: Yup.string().required(),
    });

    return (
        <Formik initialValues={{username: "", password: ""}} onSubmit={async (values) => {
            await submit(values, {method: "post"})
        }} validationSchema={validationSchema}>{_formik => (
            <div className="flex items-center justify-center m-auto min-w-xs">
                <Form className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-md space-y-5">
                    <h2 className="text-2xl font-semibold text-center">Login</h2>
                    <div>
                        <Input label="Username" type="text" name="username"
                               className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div>
                        <Input label="Username" type="password" name="password"
                               className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>

                    <button type="submit" className="w-full py-2 bg-blue-600 text-white
                    rounded-lg hover:bg-blue-700 transition">Log In
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
