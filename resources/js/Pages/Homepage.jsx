"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { router } from "@inertiajs/react";
import FlashMessage from "@/Components/FlashMessage";

export default function Homepage({ flash, auth }) {
  const messages = [
    "This is a Minecraft chat that can help make writing mods easier",
    "Start creating your Minecraft mod with ease!",
    "Enhance your Minecraft experience with custom mods",
    "Build, modify, and share your Minecraft mods easily",
    "A chatbot that helps you code Minecraft mods effortlessly"
  ];

  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const typingSpeed = 40;
    const delayBetweenLoops = 2000;

    if (index < message.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + message[index]);
        setIndex((prev) => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timeout);
    } else {
      const resetTimeout = setTimeout(() => {
        const newMessage = messages[Math.floor(Math.random() * messages.length)];
        setMessage(newMessage);
        setDisplayedText("");
        setIndex(0);
      }, delayBetweenLoops);

      return () => clearTimeout(resetTimeout);
    }
  }, [index, message]);

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
          <nav className="flex justify-between items-center px-12 pt-8">
            <span className="text-3xl font-bold text-white">
              <img src="/images/logo.png" alt="Background" className="object-cover w-[300px]" />
            </span>
            <div className="flex gap-8">
              {auth.user ? (
                <>
                  {/* ถ้าเป็น admin จะแสดงปุ่ม admin */}
                  {auth.admin && (
                    <button
                      className="relative transition-all duration-300 transform hover:scale-105 group"
                      onClick={() => router.get(`/admin`)}
                    >
                      <img src="/images/admin.png" className="object-cover w-[180px] group-hover:hidden" />
                      <img src="/images/admin-hover.png" className="object-cover w-[180px] hidden group-hover:block" />
                    </button>
                  )}

                  {/* ปุ่ม Logout สำหรับทุกคนที่ login แล้ว */}
                  <button
                    className="relative transition-all duration-300 transform hover:scale-105 group"
                    onClick={() => router.post(`/logout`)}
                  >
                    <img src="/images/logout.png" className="object-cover w-[100px] group-hover:hidden" />
                    <img src="/images/logout-hover.png" className="object-cover w-[100px] hidden group-hover:block" />
                  </button>
                </>
              ) : (
                <>
                  {/* ส่วนของคนที่ยังไม่ได้ login */}
                  <button
                    className="relative transition-all duration-300 transform hover:scale-105 group"
                    onClick={() => router.get(`/login`)}
                  >
                    <img src="/images/login.png" className="object-cover w-[80px] group-hover:hidden" />
                    <img src="/images/login-hover.png" className="object-cover w-[80px] hidden group-hover:block" />
                  </button>
                  <button
                    className="relative transition-all duration-300 transform hover:scale-105 group"
                    onClick={() => router.get(`/register`)}
                  >
                    <img src="/images/register.png" className="object-cover w-[128px] group-hover:hidden" />
                    <img src="/images/register-hover.png" className="object-cover w-[128px] hidden group-hover:block" />
                  </button>
                </>
              )}
            </div>
          </nav>
          {/* Main Content */}
          <main className="px-6 lg:px-16 h-[calc(100vh-80px)] flex items-center">
            <div className="max-w-xl w-full text-left">
              <div className="min-h-[120px] md:min-h-[144px] flex items-center">
                <motion.h2
                  key={message}
                  className="text-4xl mt-6 text-white font-semibold"
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.75 }}
                >
                  {displayedText}
                </motion.h2>
              </div>

              <p className="text-md text-white mb-[64px] text-justify">
                Our website uses OpenAI GPT-4o with a RAG system to provide an intelligent chatbot that assists in creating Minecraft Bedrock Addons. It offers precise guidance, resolves issues quickly, and supports both beginners and professionals in the development process.
              </p>

              <div className="mt-12 flex justify-start">
                <a
                  className="font-bold text-lg bg-gradient-to-r from-[#4F46E5] to-[#9333EA] hover:from-[#4338CA] hover:to-[#7E22CE] text-white px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
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