"use client";

import React, { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

export const TextReveal = ({
  text,
  highlightedText,
  className = "",
}: {
  text: string;
  highlightedText: string;
  className?: string;
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true,  });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  // Split text into words
  const words = text.split(" ");
  const highlightedWords = highlightedText.split(" ");

  return (
    <motion.h1
      ref={ref}
      className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight ${className}`}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-2"
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1,
              transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
              },
            },
          }}
        >
          <span className={highlightedWords.includes(word) ? "text-blue-500" : ""}>
            {word}
          </span>
        </motion.span>
      ))}
    </motion.h1>
  );
};
