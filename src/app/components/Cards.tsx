import { Trash2, Pencil, Eye, EyeOff, Copy } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface CardsProps {
  
  label: string;
  data: {
    label: string;
    value: string | number;
    isPassword?: boolean; // Identifica si es campo contraseña
    

  }[];
    OpenOnEditModal: () => void;
    OpenOnDeletetModal: () => void;
    onEditButton:() => void;
    onCopyButton?: () => void;
    OpenOnCopyModal?: () => void;
}

export default function Cards({  label, data,onEditButton,OpenOnEditModal,OpenOnDeletetModal, onCopyButton, OpenOnCopyModal}: CardsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
      transition={{ duration: 0.3 }}
      className="w-140 mr-10 shadow-lg rounded-2xl overflow-hidden"
    >
      <div className="bg-tangaroa-950 w-full h-15 flex justify-end gap-2">
        {onCopyButton && OpenOnCopyModal && (
          <motion.button 
            whileHover={{ scale: 1.1, color: "#3b82f6" }}
            whileTap={{ scale: 0.9 }}
            onClick={()=>{ void onCopyButton(); void OpenOnCopyModal(); }} 
            className="h-5 p-3 cursor-pointer transition-all"
            title="Copiar curso"
          >
            <Copy />
          </motion.button>
        )}
        <motion.button 
          whileHover={{ scale: 1.1, color: "#991b1b" }}
          whileTap={{ scale: 0.9 }}
          onClick={()=>{ void OpenOnDeletetModal(); void onEditButton(); }} 
          className="h-5 p-3 cursor-pointer transition-all"
        >
          <Trash2 />
        </motion.button>
      </div>
      <div className="flex bg-putty-50 w-full h-full  text-tangaroa-950 justify-between px-10 py-5 ">
        <ul>
          <li className="text-xl font-bold">{label}</li>
          {data.map((item, idx) => (
            <li key={idx}>{item.label}</li>
          ))}
        </ul>
        <ul>
          <motion.li 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={()=>{ void onEditButton(); void OpenOnEditModal(); }}  
          >
            <Pencil size={30} className="cursor-pointer" />
          </motion.li>
          {data.map((item, idx) => {
            if (item.isPassword) {
              return (
                <li key={idx} className="flex items-center gap-2">
                  <span>{showPassword ? item.value : "**********"}</span>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    className="focus:outline-none"
                    aria-label="Mostrar contraseña"
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </motion.button>
                </li>
              );
            }
            return <li key={idx}>{item.value}</li>;
          })}
        </ul>
      </div>
    </motion.div>
  );
}

