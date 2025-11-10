"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import NavLink from "../NavLink";

const links = [
  { name: "Features", href: "#features" },
  { name: "API", href: "#api" },
  { name: "Pricing", href: "#pricing" },
  { name: "Docs", href: "#" },
  { name: "Terms", href: "#" },
  { name: "Privacy", href: "#" },
];

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8 }}
      className="bg-card"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <motion.a
              href="/"
              className="text-2xl font-bold"
              style={{
                background: "linear-gradient(to right, #BEF264, #22D3EE)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
            >
              Intent API
            </motion.a>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-neutral-400 mt-2"
            >
              &copy; {new Date().getFullYear()} Intent API. All rights reserved.
            </motion.p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end space-x-6">
            {links.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
              >
                <NavLink
                  href={link.href}
                  className="text-neutral-400"
                  gradientClass="text-gradient-cyan-purple"
                >
                  {link.name}
                </NavLink>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
