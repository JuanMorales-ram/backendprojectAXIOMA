"use client";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function UpdateGroupModal({
  children,
  isOpen,
  onClose,
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-putty-50 rounded-lg p-10 w-[810px] max-w-full  relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-amber-700 hover:text-amber-500 transition-colors"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
