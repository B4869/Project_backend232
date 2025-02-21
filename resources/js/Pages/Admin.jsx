import { useForm } from "@inertiajs/react"
import { Loader2, UploadCloud, X, Pencil, Trash2, FileText } from "lucide-react"
import { useState } from "react"
import { router } from "@inertiajs/react"
import FormattedMessage from "@/Components/FormattedMessage"
import Swal from "sweetalert2"
import FlashMessage from "@/Components/FlashMessage"

export default function Admin({ flash, rule_bases }) {
  const [editingRule, setEditingRule] = useState(null)
  const [isAddingRule, setIsAddingRule] = useState(false)

  const { data, setData, post, errors, processing, reset } = useForm({
    file: null,
  })

  const editForm = useForm({
    rule: "",
  })

  const createForm = useForm({
    rule: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    post(route("upload_data.store"))
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setData("file", selectedFile)
  }

  const handleRemoveFile = (e) => {
    e.preventDefault()
    reset("file")
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    router.put(route("rule_bases.update", editingRule.id), editForm.data, {
      onSuccess: () => {
        setEditingRule(null)
        editForm.reset()
      },
    })
  }

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    router.post(route("rule_bases.store"), createForm.data, {
      onSuccess: () => {
        setIsAddingRule(false)
        createForm.reset()
      },
    })
  }

  const handleDelete = (rule) => {
    Swal.fire({
      title: "Delete rule?",
      text: "This rule will be permanently deleted. This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: "#ffffff",
      customClass: {
        popup: "rounded-xl shadow-xl border border-gray-200",
        title: "text-xl font-semibold text-gray-900 text-left",
        htmlContainer: "text-gray-600 text-left",
        actions: "gap-2",
        confirmButton: "bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white transition-colors",
        cancelButton: "bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-gray-700 transition-colors",
        icon: "border-red-100 text-red-600",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route("rule_bases.destroy", rule.id))
      }
    })
  }

  return (
    <>
      <FlashMessage flash={flash} />
      <div className="min-h-screen bg-gray-150 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl space-y-24">
          {/* Upload Section */}
          <div className="w-full">
            <div>
              <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">Upload JSON File</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white border-none shadow-2xl rounded-xl p-8">
              <div className="rounded-md">
                <div className="mb-4">
                  <label
                    htmlFor="file-upload"
                    className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
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
                          <p className="text-xs text-gray-500">{(data.file.size / 1024 / 1024).toFixed(2)} MB</p>
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

                    <input id="file-upload" type="file" accept=".json" onChange={handleFileChange} className="hidden" />
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

          {/* Rule Base Section */}
          <div className="w-full">
            <h3 className="text-center text-3xl font-extrabold text-gray-900 mb-8">Rule Base</h3>
            <div className="bg-white border-none shadow-2xl rounded-xl p-8">
              <div className="space-y-4">
                {isAddingRule && (
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-300 border-dashed">
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                      <div className="relative">
                        <textarea
                          value={createForm.data.rule}
                          onChange={(e) => createForm.setData("rule", e.target.value)}
                          className="w-full bg-white text-gray-black rounded-xl p-4 pr-4 resize-none border-2 border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 min-h-[100px] placeholder-gray-400"
                          placeholder="Enter rule content..."
                        />
                      </div>
                      {createForm.errors.rule && <p className="text-sm text-red-400">{createForm.errors.rule}</p>}
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingRule(false)}
                          className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={createForm.processing}
                          className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
                        >
                          {createForm.processing ? (
                            <>
                              <Loader2 className="inline-block animate-spin h-4 w-4 mr-2" />
                              Creating...
                            </>
                          ) : (
                            "Create"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {(rule_bases.length > 0 || isAddingRule) ? (
                  <div className="space-y-4">
                    {rule_bases.map((rule, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border-2 border-gray-300 border-dashed hover:bg-gray-100 transition-colors duration-200 relative group"
                      >
                        {editingRule?.id === rule.id ? (
                          <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="relative">
                              <textarea
                                value={editForm.data.rule}
                                onChange={(e) => editForm.setData("rule", e.target.value)}
                                className="w-full bg-white text-gray-black rounded-xl p-4 pr-4 resize-none border-2 border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 min-h-[100px] placeholder-gray-400"
                                placeholder="Edit rule content..."
                              />
                            </div>
                            {editForm.errors.rule && <p className="text-sm text-red-400">{editForm.errors.rule}</p>}
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingRule(null)}
                                className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={editForm.processing}
                                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
                              >
                                {editForm.processing ? "Saving..." : "Save"}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <FormattedMessage className="pr-16 text-gray-800" content={rule.rule} />
                            <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => {
                                  setEditingRule(rule)
                                  editForm.setData("rule", rule.rule)
                                }}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
                              >
                                <Pencil className="h-4 w-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDelete(rule)}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">No rules found</div>
                )}

                <button
                  onClick={() => setIsAddingRule(true)}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <FileText className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                  </span>
                  Add Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}