"use client";

import { Plus  } from "lucide-react";
import { motion } from "framer-motion";

interface PlusbuttonProps {
  OpenOnPlusModal:() => void;
  className: string;

}

export default function PlusButton({ className, OpenOnPlusModal}: PlusbuttonProps) {

  
  return (
    <>
    <motion.button   
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={OpenOnPlusModal} 
      className={"flex bg-tangaroa-900 rounded-xl justify-center p-2 hover:bg-tangaroa-950 transition-all " + className}
    >
      <Plus></Plus>
    </motion.button>
   
    </>
  );
}
