"use client";
import { ShieldCheck, Smile, Zap, Globe, Cpu, Scaling } from "lucide-react";
import React from "react";
import { PointerHighlight } from "../ui/pointer-highlight";
import { motion } from "framer-motion";

const features = [
  {
    name: "Advanced Harrassment Detection",
    description:
      "Our AI model is trained to detect subtle forms of harrassment and abuse in text, ensuring a safer online environment.",
    highlight: "subtle forms of harrassment and abuse",
    icon: <ShieldCheck className="w-12 h-12" />,
    gradient: "linear-gradient(to right, #22D3EE, #D946EF)",
    glowColor: "rgba(34, 211, 238, 0.4)", // Cyan glow
  },
  {
    name: "Emoji Intent Analysis",
    description:
      "We don't just read text. Our API understands the intent behind emojis, preventing users from hiding abuse behind playful icons.",
    highlight: "intent behind emojis",
    icon: <Smile className="w-12 h-12" />,
    gradient: "linear-gradient(to right, #D946EF, #F97316)",
    glowColor: "rgba(217, 70, 239, 0.4)", // Purple glow
  },
  {
    name: "Real-Time Processing",
    description:
      "Get instant feedback on messages with our low-latency API, allowing for real-time content moderation.",
    highlight: "instant feedback on messages",
    icon: <Zap className="w-12 h-12" />,
    gradient: "linear-gradient(to right, #F97316, #BEF264)",
    glowColor: "rgba(249, 115, 22, 0.4)", // Orange glow
  },
  {
    name: "Multi-lingual Support",
    description:
      "Our models are trained on a diverse dataset to detect intent across multiple languages.",
    highlight: "detect intent across multiple languages",
    icon: <Globe className="w-12 h-12" />,
    gradient: "linear-gradient(to right, #BEF264, #22D3EE)",
    glowColor: "rgba(190, 242, 100, 0.4)", // Green glow
  },
  {
    name: "Easy Integration",
    description:
      "Integrate our stateless API into your application in minutes with our simple and well-documented SDKs.",
    highlight: "stateless API into your application in minutes",
    icon: <Cpu className="w-12 h-12" />,
    gradient: "linear-gradient(to right, #22D3EE, #F97316)",
    glowColor: "rgba(34, 211, 238, 0.4)", // Cyan glow
  },
  {
    name: "Scalable and Reliable",
    description:
      "Built on a robust infrastructure, our API is designed to handle millions of requests without compromising on performance.",
    highlight: "designed to handle millions of requests",
    icon: <Scaling className="w-12 h-12" />,
    gradient: "linear-gradient(to right, #D946EF, #BEF264)",
    glowColor: "rgba(217, 70, 239, 0.4)", // Purple glow
  },
];

export function Features() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            Powerful Features to Keep Your Platform Safe
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-neutral-400 mt-4 max-w-3xl mx-auto"
          >
            Our API provides a comprehensive suite of tools to help you maintain
            a healthy and safe online community.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              className="relative p-px rounded-lg" // Removed overflow-hidden
              style={{ background: "oklch(0.25 0 0)" }} // Muted monochrome normally
              animate={{ boxShadow: "0 0 0px 0px rgba(0,0,0,0)" }} // Default no shadow
              whileHover={{
                background: feature.gradient, // Colorful on hover
                boxShadow: `0 0 10px 3px ${feature.glowColor}, 0 0 20px 6px ${feature.glowColor}`, // Dynamic color neon glow
              }}
              transition={{
                background: { duration: 0.5, ease: "easeOut" },
                boxShadow: { duration: 0.5, ease: "easeOut" }, // Transition for boxShadow
              }}
            >
              <div className="bg-card p-6 rounded-lg h-full w-full">
                <div
                  className="flex items-center justify-center h-16 w-16 rounded-full mb-4"
                  style={{ background: feature.gradient }}
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      repeatType: "mirror",
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.name}
                </h3>
                <div className="text-neutral-400">
                  {feature.description
                    .split(feature.highlight)
                    .map((part, i) => (
                      <React.Fragment key={i}>
                        {part}
                        {i <
                          feature.description.split(feature.highlight).length -
                            1 && (
                          // <PointerHighlight
                          //   rectangleClassName={`leading-loose`}
                          //   pointerClassName={`h-3 w-3`}
                          //   containerClassName="inline-block mx-1"
                          // >
                          <span
                            className="relative z-10 font-bold text-xl"
                            style={{
                              background: feature.gradient,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {feature.highlight}
                          </span>
                          // </PointerHighlight>
                        )}
                      </React.Fragment>
                    ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
