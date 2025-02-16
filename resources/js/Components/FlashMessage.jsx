import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export default function FlashMessage({ flash }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [flash]);

  if (!isVisible || (!flash.success && !flash.error)) return null;

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div
      className={`fixed top-4 z-50 right-4 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden transition-all duration-300 ease-in-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      } ${flash.success ? "bg-green-50 border-l-4 border-green-400" : "bg-red-50 border-l-4 border-red-400"}`}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {flash.success ? (
              <CheckCircle className="h-6 w-6 text-green-400" aria-hidden="true" />
            ) : (
              <XCircle className="h-6 w-6 text-red-400" aria-hidden="true" />
            )}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm font-medium ${flash.success ? "text-green-800" : "text-red-800"}`}>
              {flash.success ? "Success" : "Error"}
            </p>
            <p className={`mt-1 text-sm ${flash.success ? "text-green-700" : "text-red-700"}`}>
              {flash.success || flash.error}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                flash.success
                  ? "text-green-500 hover:text-green-600 focus:ring-green-500"
                  : "text-red-500 hover:text-red-600 focus:ring-red-500"
              }`}
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

