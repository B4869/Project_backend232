import { useForm, usePage } from "@inertiajs/react"
import { Loader2, Mail, ArrowRight } from "lucide-react"
import FlashMessage from "@/Components/FlashMessage"

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    })
    const { flash, status } = usePage().props

    const submit = (e) => {
        e.preventDefault()
        post(route("password.email"))
    }

    return (
        <>
            <FlashMessage flash={flash} />
            <div className="min-h-screen bg-gray-150 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Forgot Password</h2>
                    </div>
                    <form onSubmit={submit} className="mt-8 space-y-6 bg-white border-none shadow-2xl rounded-xl p-8">
                        <div className="rounded-md -space-y-px">
                            <div className="mb-4 text-sm text-gray-600">
                                Forgot your password? No problem. Just let us know your email address and we will email you a password
                                reset link that will allow you to choose a new one.
                            </div>

                            {status && <div className="mb-4 text-sm font-medium text-green-600">{status}</div>}

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
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        autoFocus
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
                                        <ArrowRight className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                                    </span>
                                )}
                                {processing ? "Sending..." : "Email Password Reset Link"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

