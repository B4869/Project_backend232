import FlashMessage from "@/Components/FlashMessage";
import { useForm } from "@inertiajs/react";
import { Loader2, UploadCloud, X } from "lucide-react";

export default function UploadData({ flash }) {
  const { data, setData, post, errors, processing, reset } = useForm({
    file: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("upload_data.store"));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setData("file", selectedFile);
  };

  const handleRemoveFile = (e) => {
    e.preventDefault();
    reset("file");
  };

  return (
    <>
      <FlashMessage flash={flash} />
      <div className="min-h-screen bg-gray-150 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Upload JSON File
            </h2>
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6 bg-white border-none shadow-2xl rounded-xl p-8"
          >
            <div className="rounded-md -space-y-px">
              <div className="mb-4">
                <label
                  htmlFor="file-upload"
                  className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  {data.file && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {data.file ? (
                      <>
                        <UploadCloud className="w-8 h-8 mb-4 text-green-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">{data.file.name}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {(data.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-10 h-10 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">JSON file only</p>
                      </>
                    )}
                  </div>
                  
                  <input
                    id="file-upload"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {errors.file && (
                  <p className="mt-2 text-sm text-red-600" id="file-error">
                    {errors.file}
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
                    <UploadCloud className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                  </span>
                )}
                {processing ? "Uploading..." : "Upload File"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}