"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const tiers = [
  {
    name: "Developer",
    price: "Rs. 0",
    frequency: "/month",
    description: "For personal projects and testing.",
    features: ["1,000 requests/month", "Community support", "Basic analytics"],
    cta: "Get Started",
    href: "/register",
    gradient: "linear-gradient(to bottom right, #22D3EE, #D946EF)",
  },
  {
    name: "Enterprise",
    price: "Custom",
    frequency: "",
    description: "For large-scale applications and businesses.",
    features: [
      "Unlimited requests",
      "Dedicated support",
      "Advanced analytics",
      "Custom models",
      "On-premise deployment",
    ],
    cta: "Contact Us",
    href: "mailto:sales@intentapi.com",
    gradient: "linear-gradient(to bottom right, #C85C12, #98C04F)",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-neutral-400 mt-4 max-w-3xl mx-auto"
          >
            Choose the plan that is right for you.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-px rounded-lg overflow-hidden"
              style={{ background: tier.gradient }}
            >
              <div className="bg-card p-8 rounded-lg h-full w-full flex flex-col">
                <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                <p className="mt-4 text-neutral-400">{tier.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-white">
                    {tier.price}
                  </span>
                  <span className="text-lg font-medium text-neutral-400">
                    {tier.frequency}
                  </span>
                </div>
                <ul className="mt-8 space-y-4 flex-grow">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "mirror",
                        }}
                      >
                        <Check
                          className="w-5 h-5"
                          style={{ color: "#BEF264" }}
                        />
                      </motion.div>
                      <span className="text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href={tier.href}>
                    <motion.p
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="block w-full text-center px-6 py-3 rounded-md font-semibold"
                      style={{ background: tier.gradient, color: "white" }}
                    >
                      {tier.cta}
                    </motion.p>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
