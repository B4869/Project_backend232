import { useForm, Link, usePage } from "@inertiajs/react"
import { Loader2, Mail, LogOut } from "lucide-react"
import FlashMessage from "@/Components/FlashMessage"

export default function VerifyEmail({ status }) {
  const { post, processing } = useForm({})
  const { flash } = usePage().props

  const submit = (e) => {
    e.preventDefault()
    post(route("verification.send"))
  }

  return (
    <>
      <FlashMessage flash={flash} />
      <div className="min-h-screen bg-gray-150 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Email Verification</h2>
          </div>
          <div className="mt-8 space-y-6 bg-white border-none shadow-2xl rounded-xl p-8">
            <div className="text-sm text-gray-600">
              Thanks for signing up! Before getting started, could you verify your email address by clicking on the link
              we just emailed to you? If you didn't receive the email, we will gladly send you another.
            </div>

            {status === "verification-link-sent" && (
              <div className="text-sm font-medium text-green-600">
                A new verification link has been sent to the email address you provided during registration.
              </div>
            )}

            <form onSubmit={submit} className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={processing}
                  className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {processing ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-3" />
                  ) : (
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    </span>
                  )}
                  {processing ? "Sending..." : "Resend Verification Email"}
                </button>

                <Link
                  href={route("logout")}
                  method="post"
                  as="button"
                  className="inline-flex items-center px-4 py-2 border-2 border-indigo-400 text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Log Out
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

