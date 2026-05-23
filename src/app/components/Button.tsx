"use client";

import { motion } from "framer-motion";



interface buttonProps {
  label: string;
  className: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button({ label, className, onClick, disabled }: buttonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      disabled={disabled}
      className={"bg-putty-600 rounded-sm py-2 px-4 min-w-55 w-fit mt-15 transition-colors " + className}
    >
      {label}
    </motion.button>
  );
}
