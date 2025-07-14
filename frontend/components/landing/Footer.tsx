"use client";
import React from "react";
import { motion } from "framer-motion";
import { Inter, Poppins } from "next/font/google";
import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

const SimpleFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Demo", href: "#demo" }
    ],
    resources: [
      { name: "Blog", href: "#blog" },
      { name: "Help", href: "#help" },
      { name: "Changelog", href: "#changelog" }
    ],
    legal: [
      { name: "Privacy", href: "#privacy" },
      { name: "Terms", href: "#terms" }
    ]
  };

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "mailto:hello@redlead.com", label: "Email" }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Logo" className="h-10 " />
                <span className={` text-2xl font-black text-white ${poppins.className}`}>

                  red
                  <span className={` text-2xl bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent  ${poppins.className}`}>lead</span>
                </span>
 
              </div>
              <p className={`text-white/70 mb-6 max-w-sm leading-relaxed ${inter.className}`}>
                AI-powered Reddit lead generation tool.
              </p>
              
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <span className={inter.className}>Made with</span>
                <Heart className="w-4 h-4 text-red-400" />
                <span className={inter.className}>by a solo founder</span>
              </div>
            </motion.div>
          </div>

          {/* Product Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className={`text-white font-semibold mb-4 ${poppins.className}`}>
                Product
              </h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className={`text-white/70 hover:text-orange-400 transition-colors duration-200 text-sm ${inter.className}`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Resources Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className={`text-white font-semibold mb-4 ${poppins.className}`}>
                Resources
              </h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className={`text-white/70 hover:text-orange-400 transition-colors duration-200 text-sm ${inter.className}`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Legal Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className={`text-white font-semibold mb-4 ${poppins.className}`}>
                Legal
              </h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className={`text-white/70 hover:text-orange-400 transition-colors duration-200 text-sm ${inter.className}`}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between"
        >
          <p className={`text-white/60 text-sm ${inter.className}`}>
            © {currentYear} Redlead. Built by  <Link href={"https://x.com/attharrva15"}>@attharrva15</Link>
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-orange-400 hover:bg-white/20 transition-all duration-300"
                  aria-label={social.label}
                >
                  <IconComponent className="w-4 h-4" />
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
