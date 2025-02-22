import { useState, useRef, useEffect } from "react"
import { Plus, Send, SidebarOpen, SidebarClose, ChevronsUpDownIcon, Trash2 } from "lucide-react"
import axios from "axios"
import { router } from "@inertiajs/react"
import FlashMessage from "@/Components/FlashMessage"
import Swal from "sweetalert2"
import FormattedMessage from "@/Components/FormattedMessage"

export default function Chat({ auth, flash }) {
  // ===== State Management =====
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [chatHistories, setChatHistories] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [chatName, setChatName] = useState("New Chat")
  const [showProfile, setShowProfile] = useState(false)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  /* ===== API Functions ===== */
  const sendMessage = async (content, historyId) => {
    const csrfTokenElement = document.querySelector('meta[name="csrf-token"]')
    const csrfToken = csrfTokenElement ? csrfTokenElement.getAttribute("content") : ""

    return axios.post("/chat/ask", { content, history_id: historyId }, { headers: { "X-CSRF-TOKEN": csrfToken } })
  }

  /* ===== Effects & Handlers ===== */
  useEffect(() => {
    const fetchChatHistories = async () => {
      try {
        const response = await axios.get("/chat/histories")
        const histories = response.data
        setChatHistories(histories)
        if (histories.length > 0 && !currentChatId) {
          const response = await axios.get(`/chat/history/${histories[0].id}`)
          const data = response.data
          setMessages(
            data.messages.map((msg) => ({
              text: msg.message,
              sender: msg.sender,
            })),
          )
          setChatName(data.chat_name)
          setCurrentChatId(histories[0].id)
        }
      } catch (error) {
        console.error("Error fetching chat histories:", error)
      }
    }
    fetchChatHistories()
  }, [currentChatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (message.trim() === "") return

    setMessages((prev) => [...prev, { text: message, sender: "user" }])
    setMessage("")
    setLoading(true)

    try {
      const response = await sendMessage(message, currentChatId)
      const data = response.data
      setMessages((prev) => [...prev, { text: data.message, sender: "assistant" }])

      if (chatName === "New Chat") {
        const newChatName = message.substring(0, 50)
        setChatName(newChatName)
        setChatHistories((prev) =>
          prev.map((history) => (history.id === currentChatId ? { ...history, chat_name: newChatName } : history)),
        )
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          text: `Error: ${error.response?.data?.message || error.message || "An unknown error occurred"}`,
          sender: "assistant",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = async () => {
    try {
      const response = await axios.post("/chat/new")
      setMessages([])
      setChatName("New Chat")
      setCurrentChatId(response.data.history_id)
      const historiesResponse = await axios.get("/chat/histories")
      setChatHistories(historiesResponse.data)
    } catch (error) {
      console.error("Error creating new chat:", error)
    }
  }

  const handleDeleteChat = (id) => {
    Swal.fire({
      title: "Delete chat?",
      text: "The chat will be deleted and removed from your chat history. This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: "#1f1f1f",
      customClass: {
        popup: "rounded-2xl border border-gray-700",
        title: "text-xl font-semibold text-white text-left",
        htmlContainer: "text-gray-300 text-left",
        actions: "gap-2",
        confirmButton: "bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white",
        cancelButton: "bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(`/chat/${id}`)
        window.location.reload()
      }
    })
  }

  const fetchChatHistory = async (historyId) => {
    try {
      const response = await axios.get(`/chat/history/${historyId}`)
      const data = response.data
      setMessages(
        data.messages.map((msg) => ({
          text: msg.message,
          sender: msg.sender,
        })),
      )
      setChatName(data.chat_name)
      setCurrentChatId(historyId)
    } catch (error) {
      console.error("Error fetching chat history:", error)
    }
  }

  return (
    <>
      <FlashMessage flash={flash} />
      <div className="flex h-screen bg-gray-900 text-gray-100 font-prompt overflow-hidden relative">
        {/* ===== Sidebar ===== */}
        <aside
          className={`w-80 md:w-72 lg:w-80 bg-gray-800 border-r border-gray-700 flex flex-col fixed h-full transition-transform duration-300 ease-in-out ${showSidebar ? "translate-x-0" : "-translate-x-full"
            } z-20`}
        >
          {/* Sidebar Header */}
          <div className="p-5 flex items-center justify-between border-b border-gray-700">
            <button onClick={() => router.get(`/`)}>
              <img src="/images/logo2.png" alt="Logo" className="object-cover w-[140px] sm:w-[180px]" />
            </button>
            <button onClick={() => setShowSidebar(false)} className="text-gray-300 hover:text-white focus:outline-none">
              <SidebarClose className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="px-4 py-8 pb-4">
            <button
              onClick={handleNewChat}
              className="font-semibold justify-center bg-indigo-600 px-3 sm:px-4 py-2 sm:py-[10px] rounded-lg text-white hover:bg-indigo-700 transition-colors flex items-center space-x-2 sm:space-x-3 w-full text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-2">
              <h2 className="text-sm sm:text-md text-gray-400 font-semibold px-2 sm:px-3 py-2">Recent Chats</h2>
              {chatHistories.map((history) => (
                <button
                  key={history.id}
                  onClick={() => fetchChatHistory(history.id)}
                  className={`w-full flex justify-between items-center text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm sm:text-base ${currentChatId === history.id ? "bg-gray-700 text-white" : ""
                    }`}
                >
                  <span>{history.chat_name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteChat(history.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </button>
              ))}
            </div>
          </div>

          {/* Profile Section */}
          <div className="border-t border-gray-700 relative">
            <button onClick={() => setShowProfile(!showProfile)} className="w-full">
              <div className="p-4 py-3 flex items-center relative justify-between hover:bg-gray-700 hover:text-white transition-color">
                <div className="flex items-center relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 flex-shrink-0" />
                  <span className="ml-2 sm:ml-3 text-base sm:text-lg">My Profile</span>
                </div>
                <ChevronsUpDownIcon
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${showProfile ? "rotate-180" : ""}`}
                />
              </div>
            </button>
            {showProfile && (
              <div className="absolute bottom-full left-0 w-full sm:w-80 mb-3 px-2 sm:px-4 overflow-hidden z-50">
                <div className="p-3 sm:p-6 bg-gray-700 rounded-lg">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-500" />
                      <div>
                        <p className="text-base sm:text-lg font-medium text-white">{auth.user.name}</p>
                        <p className="text-sm sm:text-base text-gray-300">{auth.user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        router.post("/logout")
                        setShowProfile(false)
                      }}
                      className="w-full bg-gray-600 hover:bg-gray-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ===== Main Content ===== */}
        <main
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${showSidebar ? "md:ml-72 lg:ml-80" : "ml-0"} w-full`}
        >
          {/* Header */}
          <header className="bg-gray-900 border-b border-gray-700 p-6 flex items-center relative">
            <button
              onClick={() => setShowSidebar(true)}
              className={`text-gray-300 hover:text-white mr-4 absolute left-4 transition-opacity ${showSidebar ? "opacity-0 duration-200" : "opacity-100 delay-300 duration-300"
                }`}
              aria-label="Open sidebar"
            >
              <SidebarOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <p className="text-sm sm:text-md flex-grow text-center">{chatName}</p>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-gray-900 mt-4 sm:mt-6">
            <div className="space-y-6 sm:space-y-10 max-w-3xl mx-auto px-2 sm:px-0">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`rounded-lg max-w-[85%] sm:max-w-3xl px-1 sm:px-1 break-words text-sm sm:text-base ${msg.sender === "user" ? "bg-indigo-600 text-white" : "text-white"
                      }`}
                  >
                    <FormattedMessage content={msg.text} />
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-4 py-3 max-w-3xl">
                    <div className="flex space-x-1">
                      {[0, 0.1, 0.2].map((delay, i) => (
                        <div
                          key={i}
                          className="h-2 w-2 bg-gray-600 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="p-2 sm:p-4 pt-0 mb-2 bg-transparent">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto px-2 sm:px-0">
              <div className="flex gap-2">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                  rows={1}
                  className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[40px] sm:min-h-[48px] max-h-[200px] overflow-y-auto text-sm sm:text-base"
                  placeholder="พิมพ์ข้อความของคุณ..."
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-10 sm:h-12 sm:w-12 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                  aria-label="ส่ง"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="mt-1 sm:mt-2 text-center text-[10px] sm:text-xs text-gray-400">
                คำตอบที่ได้ค่อนข้างมีความหลอนเป็นอย่างมาก ควรเช็คคำตอบก่อนนำไปใช้
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  )
}