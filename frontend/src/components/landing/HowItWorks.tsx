"use client";

import { Key, Terminal, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    name: "Get Your API Key",
    description:
      "Sign up for a free account and get your API key from the developer dashboard.",
    icon: <Key className="w-8 h-8" />,
    gradient: "linear-gradient(to right, #22D3EE, #D946EF)",
  },
  {
    name: "Make a Request",
    description:
      "Send a POST request to our API endpoint with the message you want to analyze.",
    icon: <Terminal className="w-8 h-8" />,
    gradient: "linear-gradient(to right, #D946EF, #F97316)",
  },
  {
    name: "Get the Result",
    description:
      "Receive a JSON response with the detected intents, emotions, and a safety score.",
    icon: <Rocket className="w-8 h-8" />,
    gradient: "linear-gradient(to right, #F97316, #BEF264)",
  },
];

export function HowItWorks() {
  return (
    <section id="api" className="py-20 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            Get Started in Minutes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-neutral-400 mt-4 max-w-3xl mx-auto"
          >
            Integrating our API is a simple three-step process.
          </motion.p>
        </div>
        <div className="relative">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 origin-top"
            style={{
              background:
                "linear-gradient(to bottom, #22D3EE, #D946EF, #F97316, #BEF264)",
            }}
            aria-hidden="true"
          ></motion.div>
          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.1, delay: index * 0.2 }}
                className="flex items-center w-full"
              >
                <div className="w-1/2 pr-8 text-right">
                  {index % 2 === 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {step.name}
                      </h3>
                      <p className="text-neutral-400">{step.description}</p>
                    </div>
                  )}
                </div>
                <div className="w-1/2 pl-8 text-left">
                  {index % 2 !== 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {step.name}
                      </h3>
                      <p className="text-neutral-400">{step.description}</p>
                    </div>
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.1, delay: index * 0.2 + 0.4 }}
                  className="absolute left-1/2 transform -translate-x-1/2 p-2 rounded-full border"
                  style={{ background: step.gradient, borderColor: "#BEF264" }}
                >
                  {step.icon}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
