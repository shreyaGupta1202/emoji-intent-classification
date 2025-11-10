"use client";

import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import GlobeComponent from "@/components/ui/globe";
import { cn } from "@/lib/utils";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Footer } from "@/components/landing/Footer";

// Re-defining BottomGradient and LabelInputContainer here for self-containment
const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default function LoginPage() {
  const supabase = createClient();

  const handleSignIn = async (provider: "github" | "google") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback?next=/classify`,
      },
    });
  };

  return (
    <main className="flex flex-col bg-background text-foreground">
      {/* Top Section: Globe and SOP Text */}
      <div className="relative w-full h-screen flex flex-col">
        <div className="relative w-full h-2/3 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 -left-[300%] top-20 scale-150 flex items-center justify-center">
            {/* Larger container for partial globe */}
            <GlobeComponent />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10"></div>{" "}
          {/* Gradient overlay */}
          {/* SOP Text - Centered on screen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute z-20 text-center px-4" // Higher z-index for text
          >
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="text-3xl md:text-5xl font-bold mb-2"
              style={{
                background: "linear-gradient(to right, #22D3EE, #D946EF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Uncover Intent. Build Smarter.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="text-base md:text-lg text-neutral-300 max-w-md mx-auto"
            >
              Intent API empowers you to understand user communication, detect
              nuances, and foster safer digital environments.
            </motion.p>
          </motion.div>
        </div>
        {/* Bottom Section: Login Form */}
        <div className="w-full flex h-1/3 items-center justify-center p-8 relative z-20 flex-grow">
          {" "}
          {/* flex-grow to take remaining height */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="shadow-input mx-auto w-[40%] rounded-none p-4 md:p-6 md:rounded-2xl"
          >
            <p className="text-center text-md text-neutral-600 dark:text-neutral-300">
              Sign in to continue your journey with Intent API and unlock
              powerful emoji-based intent detection.
            </p>

            <div className="my-4 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

            <div className="flex flex-row space-x-4">
              <button
                className="group/btn shadow-input relative flex h-10 w-full items-center justify-center space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                type="button"
                onClick={() => handleSignIn("github")}
              >
                <FaGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  GitHub
                </span>
                <BottomGradient />
              </button>
              <button
                className="group/btn shadow-input relative flex h-10 w-full items-center justify-center space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                type="button"
                onClick={() => handleSignIn("google")}
              >
                <FcGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Google
                </span>
                <BottomGradient />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
