"use client";

import { RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface ReloadbuttonProps {
  className?: string;
  onClick?: () => void;

}

export default function ReloadButton({ className, onClick }: ReloadbuttonProps) {
  return (
    <motion.button 
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9, rotate: -180 }}
      transition={{ duration: 0.3 }}
      onClick={onClick} 
      className={"flex bg-tangaroa-900 rounded-xl justify-center p-2 hover:bg-tangaroa-800 transition-all " + className}
    >
      <RotateCcw></RotateCcw>
    </motion.button>
  );
}
