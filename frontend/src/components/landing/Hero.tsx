"use client";
import React from "react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <div className="text-center relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
      <BackgroundRippleEffect rows={20} />
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-5"
        style={{
          background:
            "radial-gradient(ellipse at center 30%, transparent 50%, rgba(0,0,0,0.8) 100%)",
        }}
      ></div>
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-6xl font-bold text-white z-10"
      >
        The Modern API for <br />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, -2, 0] }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            y: { duration: 3, repeat: Infinity, repeatType: "mirror" },
          }}
          style={{
            background: "linear-gradient(to right, #22D3EE, #D946EF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Intent Detection
        </motion.span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="max-w-2xl mx-auto my-8 text-lg text-neutral-300 z-10"
      >
        Understand user intent, even with emojis. Our API provides real-time
        analysis of messages to detect harassment, abuse, and more, ensuring
        safe online interactions.
      </motion.p>
      <motion.a
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        href="/login"
        className="px-6 py-3 rounded-md font-semibold z-10"
        style={{
          background: "linear-gradient(to right, #D946EF, #F97316)",
          color: "white",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Get API Access
      </motion.a>
    </div>
  );
}
