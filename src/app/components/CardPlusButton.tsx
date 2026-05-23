// components/Cards.tsx
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface CardsPlusButtonProps {
   OpenOnPlusModal:() => void;

 
  
}


 
  

export default function  CardsPlusButton({OpenOnPlusModal }: CardsPlusButtonProps) {
  return (
    <>
      <motion.button 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3 }}
        onClick={OpenOnPlusModal} 
        className="w-90 h-80 bg-putty-50 rounded-xl text-tangaroa-950 flex items-center justify-center  shadow-lg  transition-all hover:text-putty-50 hover:bg-tangaroa-950"
      >
        <motion.div
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.3 }}
        >
          <Plus size={150}></Plus>
        </motion.div>
      </motion.button>
    </>

  );
}
