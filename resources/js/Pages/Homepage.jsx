import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { router } from "@inertiajs/react"
import FlashMessage from "@/Components/FlashMessage"

export default function Homepage({ flash, auth }) {
  const messages = [
    "Create Custom Mobs with JSON",
    "Server-Side Scripting with JavaScript",
    "Design Unique Items & Blocks",
    "Advanced Animations with Molang",
    "Professional Addon Structure",
  ]

  const [displayedText, setDisplayedText] = useState("")
  const [index, setIndex] = useState(0)
  const [message, setMessage] = useState(messages[0])

  useEffect(() => {
    const typingSpeed = 40
    const delayBetweenLoops = 2000

    if (index < message.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + message[index])
        setIndex((prev) => prev + 1)
      }, typingSpeed)

      return () => clearTimeout(timeout)
    } else {
      const resetTimeout = setTimeout(() => {
        const newMessage = messages[Math.floor(Math.random() * messages.length)]
        setMessage(newMessage)
        setDisplayedText("")
        setIndex(0)
      }, delayBetweenLoops)

      return () => clearTimeout(resetTimeout)
    }
  }, [index, message])

  return (
    <>
      <FlashMessage flash={flash} />
      <div className="min-h-screen relative bg-[#1a1a1a] font-prompt">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="/images/backgroud.png" alt="Background" className="object-cover w-full h-full brightness-[.30]" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10">
          {/* Navigation */}
          <nav className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 lg:px-12 pt-4 sm:pt-8 gap-6 sm:gap-0">
            <span className="text-3xl font-bold text-white">
              <img src="/images/logo.png" alt="Logo" className="w-[200px] sm:w-[250px] lg:w-[300px] object-contain" />
            </span>
            <div className="flex gap-4 sm:gap-4 lg:gap-8">
              {auth.user ? (
                <>
                  {auth.admin && (
                    <button
                      className="relative transition-all duration-300 transform hover:scale-105 group"
                      onClick={() => router.get(`/admin`)}
                    >
                      <img
                        src="/images/admin.png"
                        className="w-[120px] sm:w-[150px] lg:w-[180px] object-contain group-hover:hidden"
                      />
                      <img
                        src="/images/admin-hover.png"
                        className="w-[120px] sm:w-[150px] lg:w-[180px] object-contain hidden group-hover:block"
                      />
                    </button>
                  )}

                  <button
                    className="relative transition-all duration-300 transform hover:scale-105 group"
                    onClick={() => router.post(`/logout`)}
                  >
                    <img
                      src="/images/logout.png"
                      className="w-[70px] sm:w-[85px] lg:w-[100px] object-contain group-hover:hidden"
                    />
                    <img
                      src="/images/logout-hover.png"
                      className="w-[70px] sm:w-[85px] lg:w-[100px] object-contain hidden group-hover:block"
                    />
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="relative transition-all duration-300 transform hover:scale-105 group"
                    onClick={() => router.get(`/login`)}
                  >
                    <img
                      src="/images/login.png"
                      className="w-[60px] sm:w-[70px] lg:w-[80px] object-contain group-hover:hidden"
                    />
                    <img
                      src="/images/login-hover.png"
                      className="w-[60px] sm:w-[70px] lg:w-[80px] object-contain hidden group-hover:block"
                    />
                  </button>
                  <button
                    className="relative transition-all duration-300 transform hover:scale-105 group"
                    onClick={() => router.get(`/register`)}
                  >
                    <img
                      src="/images/register.png"
                      className="w-[100px] sm:w-[114px] lg:w-[128px] object-contain group-hover:hidden"
                    />
                    <img
                      src="/images/register-hover.png"
                      className="w-[100px] sm:w-[114px] lg:w-[128px] object-contain hidden group-hover:block"
                    />
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* Main Content */}
          <main className="px-12 sm:px-16 lg:px-20 h-[calc(100vh-80px)] flex items-center">
            <div className="max-w-xl w-full text-left">
              <div className="min-h-[100px] sm:min-h-[120px] lg:min-h-[144px] flex items-center">
                <motion.h2
                  key={message}
                  className="text-2xl sm:text-3xl lg:text-4xl mt-4 sm:mt-6 text-white font-semibold"
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.75 }}
                >
                  {displayedText}
                </motion.h2>
              </div>

              <p className="text-sm sm:text-base lg:text-md text-white mb-8 sm:mb-12 lg:mb-[64px] text-justify">
                Our website uses OpenAI GPT-4o with a RAG system to provide an intelligent chatbot that assists in
                creating Minecraft Bedrock Addons. It offers precise guidance, resolves issues quickly, and supports
                both beginners and professionals in the development process.
              </p>

              <div className="mt-6 sm:mt-8 lg:mt-12 flex justify-center sm:justify-start">
                <a
                  className="font-bold text-base sm:text-lg bg-gradient-to-r from-[#4F46E5] to-[#9333EA] 
                           hover:from-[#4338CA] hover:to-[#7E22CE] text-white px-6 sm:px-8 py-3 sm:py-4 
                           rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  href="/chat"
                >
                  GET STARTED
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}