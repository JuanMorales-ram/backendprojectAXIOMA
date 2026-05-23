'use client'
import { Pencil, Trash2, Copy, Users } from "lucide-react";
import { motion } from "framer-motion";


interface GroupTableProps<T> {
  headers: string[];
  rows: T[];
  OpenOnEditModal: () => void;
  OpenOnDeletetModal: () => void;
  onEditButton:(row: T) => void;
  onCopyButton?: (row: T) => void;
  onManageStudents?: (row: T) => void;
}





export default function GroupTable<T extends object>({
  headers,
  rows,
  OpenOnDeletetModal,
  OpenOnEditModal,
  onEditButton,
  onCopyButton,
  onManageStudents,
}:  GroupTableProps<T>) {
  return (
    <div className="mt-10 rounded-lg">
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-tangaroa-950">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <motion.th 
                  key={header}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="border bg-[rgba(229,229,229,1)] text-blue-950 border-tangaroa-950 px-2 py-2"
                >
                  {header}
                </motion.th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <motion.tr 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ backgroundColor: "rgba(219, 234, 254, 0.5)" }}
                className="text-center text-tangaroa-950"
              >

               {Object.values(row).map((value,i) => (
                  <td key={i} className="border border-tangaroa-950 px-2 py-1">
                     {value}
                  </td>
                ))}
                  <td className="border border-tangaroa-950 px-2 py-1">
                      <div className="flex justify-center gap-2">
                        {onManageStudents && (
                          <motion.button 
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onManageStudents(row)}
                            title="Gestionar estudiantes del grupo"
                          >
                            <Users size={16} className="text-[#0C2340] transition-all hover:text-[#B15B29]" />
                          </motion.button>
                        )}
                        <motion.button 
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={()=>{onEditButton(row); OpenOnEditModal();}}
                        >
                          <Pencil size={16} className="text-tangaroa-950 transition-all hover:text-putty-600" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={()=>{onEditButton(row); OpenOnDeletetModal();}}
                        >
                          <Trash2 size={16} className="text-tangaroa-950 transition-all hover:text-putty-600" />
                        </motion.button>
                        {onCopyButton && (
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onCopyButton(row)}
                          >
                            <Copy size={16} className="text-tangaroa-950 transition-all hover:text-putty-600" />
                          </motion.button>
                        )}
                      </div>
                  </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}