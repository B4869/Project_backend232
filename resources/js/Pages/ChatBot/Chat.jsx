import { useState, useRef, useEffect } from "react"
import { Plus, Send, SidebarOpen, SidebarClose, ChevronsUpDownIcon } from "lucide-react"
import axios from "axios"
import { router } from "@inertiajs/react"

export default function Chat({ auth }) {
  const [showProfile, setShowProfile] = useState(false)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (message.trim() === "") return

    const userMessage = { text: message, sender: "user" }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setMessage("")
    setLoading(true)

    try {
      const csrfTokenElement = document.querySelector('meta[name="csrf-token"]')
      const csrfToken = csrfTokenElement ? csrfTokenElement.getAttribute("content") : ""

      const response = await axios.post(
        "/chat/ask",
        {
          model: "gpt-4o",
          content: message,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
          },
        },
      )

      if (response.status === 200) {
        const data = response.data
        setMessages((prevMessages) => [...prevMessages, { text: data, sender: "bot" }])
      } else {
        throw new Error("API response was not ok.")
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: `Error: ${error.response?.data?.message || error.message || "An unknown error occurred"}`,
          sender: "bot",
        },
      ])
    }

    setLoading(false)
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-prompt overflow-hidden">
      <aside
        className={`w-80 bg-gray-800 border-r border-gray-700 flex flex-col fixed h-full transition-transform duration-300 ease-in-out ${showSidebar ? "translate-x-0" : "-translate-x-full"
          } z-20`}
      >
        <div className="p-5 flex items-center justify-between border-b border-gray-700">
          <button onClick={() => router.get(`/`)}>
            <img src="/images/logo.png" alt="Logo" className="object-cover w-[180px]" />
          </button>
          <button
            onClick={() => setShowSidebar(false)}
            className="text-gray-300 hover:text-white focus:outline-none"
            aria-label="Close sidebar"
          >
            <SidebarClose className="w-6 h-6" />
          </button>
        </div>
        <div className="px-4 py-8 pb-4">
          <button className="font-semibold justify-center bg-indigo-600 px-4 py-[10px] rounded-lg text-white hover:bg-indigo-700 transition-colors flex items-center space-x-3">
            <Plus />
            <span>New Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-2">
            <h2 className="text-md text-gray-400 font-semibold px-3 py-2">Recent Chats</h2>
            {[1, 2, 3].map((item) => (
              <button
                key={item}
                className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                บทสนทนาที่ {item}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-700 relative">
          <button onClick={() => setShowProfile(!showProfile)} className="w-full">
            <div className="p-4 py-3 flex items-center relative justify-between hover:bg-gray-700 hover:text-white transition-color">
              <div className="flex items-center relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 flex-shrink-0" />
                <span className="ml-3 text-lg">My Profile</span>
              </div>
              <ChevronsUpDownIcon className={`w-6 h-6 transition-transform ${showProfile ? "rotate-180" : ""}`} />
            </div>
          </button>
          {showProfile && (
            <div className="absolute bottom-full left-0 w-80 mb-3 px-4 overflow-hidden z-50">
              <div className="p-6 bg-gray-700 rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-500" />
                    <div>
                      <p className="text-lg font-medium text-white">{auth.user.name}</p>
                      <p className="text-gray-300">{auth.user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      router.post("/logout")
                      setShowProfile(false)
                    }}
                    className="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${showSidebar ? "ml-80" : "ml-0"}`}
      >
        <header className="bg-gray-900 border-b border-gray-700 p-6 flex items-center relative">
          <button
            onClick={() => setShowSidebar(true)}
            className={`text-gray-300 hover:text-white mr-4 absolute left-4 transition-opacity ${showSidebar ? "opacity-0 duration-200" : "opacity-100 delay-300 duration-300"
              }`}
            aria-label="Open sidebar"
          >
            <SidebarOpen className="w-6 h-6" />
          </button>
          <p className="text-md flex-grow text-center">บทสนทนาที่</p>
        </header>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-900 mt-6">
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-3xl ${msg.sender === "user" ? "bg-indigo-600 text-white" : ""
                    }`}
                >
                  <p className="text-md">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-6">
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

        <div className="p-4 mb-2">
          <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="พิมพ์ข้อความของคุณ..."
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="ส่ง"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

