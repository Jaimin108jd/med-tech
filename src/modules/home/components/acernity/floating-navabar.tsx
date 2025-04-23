"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const Logo = () => (
  <Link
    href="/"
    className="font-normal flex gap-2 justify-center items-center text-sm text-black px-2 py-1 shrink-0 relative z-20"
  >
    <svg
      width="28"
      height="29"
      viewBox="0 0 28 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_di_966_1877)">
        <path
          d="M4.53553 16.0355C2.58291 14.0829 2.58291 10.9171 4.53553 8.96447L10.1924 3.30761C12.145 1.35499 15.3108 1.35499 17.2635 3.30761L22.9203 8.96447C24.8729 10.9171 24.8729 14.0829 22.9203 16.0355L17.2635 21.6924C15.3108 23.645 12.145 23.645 10.1924 21.6924L4.53553 16.0355Z"
          fill="#3495eb"
        />
      </g>
      <defs>
        <filter
          id="filter0_di_966_1877"
          x="0.0712891"
          y="0.843262"
          width="27.3135"
          height="27.3135"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_966_1877"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_966_1877"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.664321 0 0 0 0 0.520459 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect2_innerShadow_966_1877"
          />
        </filter>
      </defs>
    </svg>
    <span className="font-medium text-black text-lg">Medi.ai</span>
  </Link>
);

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/#Features" },
  { name: "Ai Integration", href: "/#Ai" },
  { name: "Testimonials", href: "#Testimonial" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center justify-center w-full">
      {/* Desktop Navbar */}
      <motion.nav
        className="hidden lg:flex flex-row self-center items-center justify-between py-3 mx-auto px-8 rounded-full relative z-[100]"
        initial={{ opacity: 0, y: -10 }}
        animate={{
          opacity: 1,
          y: 0,
          width: scrolled ? "70%" : "85%",
          backgroundColor: scrolled
            ? "rgba(255, 255, 255, 0.9)"
            : "rgba(255, 255, 255, 0.7)",
          boxShadow: scrolled
            ? "0px 10px 30px -10px rgba(0, 0, 0, 0.1)"
            : "transparent 0px 0px 0px",
        }}
        transition={{
          duration: 0.3,
          damping: 10,
          power: 0.5,
          bounceStiffness: "spring",
        }}
        style={{
          width: "80%",
          backdropFilter: "blur(10px)",
        }}
      >
        <Logo />

        <div className="lg:flex flex-row flex-1 items-center justify-center space-x-4 text-sm">
          {navLinks.map((link) => (
            <div key={link.name} className="relative">
              <Link
                href={link.href}
                className="text-black/90 relative px-4 py-2 transition-colors hover:text-black"
              >
                <motion.span
                  className="relative z-10"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  {link.name}
                </motion.span>
              </Link>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <SignedIn>
              <Button
                onClick={() => (window.location.href = "/complete-profile")}
                className="px-5 py-2 text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-flex items-center justify-center rounded-[6px] bg-[linear-gradient(181deg,_#5E5E5E_18.12%,_#000_99.57%)] shadow-[0px_4px_8px_0px_rgba(3,_7,_18,_0.06),_0px_2px_4px_0px_rgba(3,_7,_18,_0.06),_0px_0px_0px_1px_rgba(3,_7,_18,_0.08),_0px_1px_1px_2px_rgba(255,_255,_255,_0.40)_inset,_0px_-1px_5px_2px_rgba(255,_255,_255,_0.40)_inset] text-white"
              >
                Go to Dashboard
              </Button>
              <SignOutButton>
                <Button
                  className="px-5 py-2 text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-flex items-center justify-center text-black bg-white rounded-[6px] border border-[#E5E5E5] shadow-md"
                  variant="outline"
                >
                  Sign Out
                </Button>
              </SignOutButton>
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="px-5 py-2 text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-flex items-center justify-center text-black bg-white rounded-[6px] border border-[#E5E5E5] shadow-md"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2 text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-flex items-center justify-center rounded-[6px] bg-[linear-gradient(181deg,_#5E5E5E_18.12%,_#000_99.57%)] shadow-[0px_4px_8px_0px_rgba(3,_7,_18,_0.06),_0px_2px_4px_0px_rgba(3,_7,_18,_0.06),_0px_0px_0px_1px_rgba(3,_7,_18,_0.08),_0px_1px_1px_2px_rgba(255,_255,_255,_0.40)_inset,_0px_-1px_5px_2px_rgba(255,_255,_255,_0.40)_inset] text-white"
              >
                Signup
              </Link>
            </SignedOut>
          </div>
        </motion.div>
      </motion.nav>

      {/* Mobile Navbar */}
      <motion.div
        className="flex relative flex-col lg:hidden w-full justify-between items-center max-w-[calc(100vw-2rem)] mx-auto z-50"
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
        style={{
          width: "85%",
          backdropFilter: "blur(16px)",
          padding: "12px 20px",
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 30px -10px",
        }}
      >
        <div className="flex flex-row justify-between items-center w-full">
          <Logo />
          <div
            tabIndex={0}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="cursor-pointer"
          >
            <Menu className="text-black/90" />
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden w-[85%] bg-white/95 backdrop-blur-lg rounded-b-lg overflow-hidden"
            style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 30px -10px" }}
          >
            <div className="flex flex-col py-4 px-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-black/90 py-2 hover:text-black"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-3 pt-4 border-t">
                <SignedIn>
                  <Link
                    href="/complete-profile"
                    className="px-4 py-2 text-sm font-bold text-center cursor-pointer hover:-translate-y-0.5 transition duration-200 text-black bg-white rounded-[6px] border border-[#E5E5E5]"
                  >
                    Go to Dashboard
                  </Link>
                  <SignOutButton>
                    <Button
                      className="px-5 py-2 text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-flex items-center justify-center text-black bg-white rounded-[6px] border border-[#E5E5E5] shadow-md"
                      variant="outline"
                    >
                      Sign Out
                    </Button>
                  </SignOutButton>
                </SignedIn>
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="px-4 py-2 text-sm font-bold text-center cursor-pointer hover:-translate-y-0.5 transition duration-200 text-black bg-white rounded-[6px] border border-[#E5E5E5]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    className="px-4 py-2 text-sm font-bold text-center cursor-pointer hover:-translate-y-0.5 transition duration-200 rounded-[6px] bg-[linear-gradient(181deg,_#5E5E5E_18.12%,_#000_99.57%)] shadow-[0px_4px_8px_0px_rgba(3,_7,_18,_0.06),_0px_2px_4px_0px_rgba(3,_7,_18,_0.06),_0px_0px_0px_1px_rgba(3,_7,_18,_0.08),_0px_1px_1px_2px_rgba(255,_255,_255,_0.40)_inset,_0px_-1px_5px_2px_rgba(255,_255,_255,_0.40)_inset] text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Signup
                  </Link>
                </SignedOut>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
