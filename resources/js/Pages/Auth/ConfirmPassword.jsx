import { useForm } from "@inertiajs/react"
import { Loader2, Lock } from "lucide-react"
import FlashMessage from "@/Components/FlashMessage"
import { usePage } from "@inertiajs/react"

export default function ConfirmPassword() {
  const { data, setData, post, processing, errors, reset } = useForm({
    password: "",
  })
  const { flash } = usePage().props

  const submit = (e) => {
    e.preventDefault()
    post(route("password.confirm"), {
      onFinish: () => reset("password"),
    })
  }

  return (
    <>
      <FlashMessage flash={flash} />
      <div className="min-h-screen bg-gray-150 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Confirm Password</h2>
          </div>
          <form onSubmit={submit} className="mt-8 space-y-6 bg-white border-none shadow-2xl rounded-xl p-8">
            <div className="rounded-md -space-y-px">
              <div className="mb-4 text-sm text-gray-600">
                This is a secure area of the application. Please confirm your password before continuing.
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    autoFocus
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600" id="password-error">
                    {errors.password}
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
                    <Lock className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                  </span>
                )}
                {processing ? "Confirming..." : "Confirm Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

