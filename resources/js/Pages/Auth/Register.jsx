import { useForm, Link, usePage } from "@inertiajs/react"
import { Loader2, UserPlus, Mail, Lock } from "lucide-react"
import FlashMessage from "@/Components/FlashMessage"

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    })
    const { flash } = usePage().props

    const submit = (e) => {
        e.preventDefault()
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        })
    }

    return (
        <>
            <FlashMessage flash={flash} />
            <div className="min-h-screen bg-gray-150 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create an account</h2>
                    </div>
                    <form onSubmit={submit} className="mt-8 space-y-6 bg-white border-none shadow-2xl rounded-xl p-8">
                        <div className="rounded-md">
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        placeholder="Enter your name"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        autoComplete="name"
                                        autoFocus
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <UserPlus className="h-5 w-5 text-gray-400" />
                                    </span>
                                </div>
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-600" id="name-error">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="Enter your email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        autoComplete="username"
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </span>
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600" id="email-error">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="Enter your password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        autoComplete="new-password"
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </span>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600" id="password-error">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        required
                                        placeholder="Enter your password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData("password_confirmation", e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        autoComplete="new-password"
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </span>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-2 text-sm text-red-600" id="password-confirmation-error">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div class="flex items-center">
                            <div class="flex-grow border-t border-gray-300"></div>
                            <div className="text-sm">
                                <Link href={route("login")} className="font-medium text-indigo-600 text-[0.825rem] mx-4">
                                    Already have an account?
                                </Link>
                            </div>
                            <div class="flex-grow border-t border-gray-300"></div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {processing ? (
                                    <Loader2 className="animate-spin h-5 w-5 mr-3" />
                                ) : (
                                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <UserPlus className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                                    </span>
                                )}
                                {processing ? "Registering..." : "Register"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

