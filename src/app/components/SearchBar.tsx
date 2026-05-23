"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface SearchBarProps<T = Record<string, unknown>> {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  data?: T[];
  onFilter?: (filteredData: T[]) => void;
}

export default function SearchBar<T = Record<string, unknown>>({ 
  className = "", 
  placeholder = "", 
  value, 
  onChange,
  data,
  onFilter 
}: SearchBarProps<T>) {
  const [internalSearch, setInternalSearch] = useState("");

  // Use external value if provided, otherwise use internal state
  const searchValue = value !== undefined ? value : internalSearch;
  const handleChange = onChange || ((e) => setInternalSearch(e.target.value));

  // Filter data when search changes
  useEffect(() => {
    if (data && onFilter) {
      if (searchValue.trim() === "") {
        onFilter(data);
      } else {
        const filtered = data.filter((item) => {
          // Verificar que item es un objeto válido
          if (!item || typeof item !== 'object') return false;
          
          // Convertir todos los valores a string, incluyendo valores null/undefined
          const searchableText = Object.values(item as Record<string, unknown>)
            .map(value => {
              if (value === null || value === undefined) return '';
              if (typeof value === 'object') return JSON.stringify(value);
              return String(value);
            })
            .join(" ")
            .toLowerCase();
            
          return searchableText.includes(searchValue.toLowerCase());
        });
        onFilter(filtered);
      }
    }
  }, [searchValue, data, onFilter]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={"flex items-center border border-tangaroa-950 rounded-md bg-tangaroa-50 px-3 py-2 w-150 " + className}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        className="flex-1 bg-transparent outline-none placeholder-[rgba(43,44,44,1)] text-tangaroa-950"
      />
      <Search className="text-[rgba(43,44,44,1)] w-4 h-4" />
    </motion.div>
  );
}