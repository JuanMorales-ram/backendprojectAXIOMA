"use client";

import Image from "next/image";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FolderDot } from "lucide-react";
import { UsersRound } from 'lucide-react';
import { GraduationCap } from 'lucide-react';
import { School } from 'lucide-react';
import { UserCog } from 'lucide-react';
import { LayoutDashboard } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { supabaseBrowser } from '../../../lib/supabaseBrowser';
import { motion } from "framer-motion";



interface MenuProps {
  className: string;
  navItems: MenuItemsProps[]
}
interface MenuItemsProps {
    name: string,
    href: string,
    icon: React.ReactNode,
  
}
export const navItems : MenuItemsProps[] = [
  {
    name: "Dashboard",
    href: "dashboard",
    icon: <LayoutDashboard />
  },
  {
    name: "Grupos",
    href: "groups",
    icon: <UsersRound />
  },
  {
    name: "Gestion de cursos",
    href: "curseManagement",
    icon: <FolderDot/>,
  },
  {
    name: "Alumnos",
    href: "Students",
    icon: <GraduationCap />,
  },

  {
    name: "Maestros",
    href: "Teacher",
    icon: <School />,
  },

  {
    name: "Usuario Admin",
    href: "ManagerUsers",
    icon: <UserCog/>,
  },
];

export default function Menu({ className ,navItems }: MenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={"w-90 h-screen bg-tangaroa-950 flex flex-col flex-shrink-0  overflow-hidden " + className}
    >
      <div className="border-b-1 mb-3 flex-shrink-0">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Image
            src="/Menu/LogoMenu.png"
            alt="Logo"
            width={1000}
            height={1000}
            className="w-50 mx-auto pt-5 pb-5 "
          ></Image>
        </motion.div>
        
      </div>

      <nav className="w-full flex-col flex justify-start items-start gap-y-1 flex-1 overflow-y-auto">{navItems.map((item, index) => {
          const isActive = pathname.includes(item.href);
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-full"
            >
              <Link
                href={item.href}
                className={`flex hover:text-putty-300 w-full gap-5 items-center hover:bg-tangaroa-900 hover:font-bold pt-2 pb-2 pl-5 transition-all duration-300 ${
                  isActive ? 'bg-tangaroa-900 text-putty-300 font-bold border-l-4 border-putty-400' : ''
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.icon}
                </motion.div>
                <span className="text-[20px]  ">{item.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="border-t-1 border-gray-600 mt-auto ">
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: "rgba(15, 23, 42, 0.8)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex hover:text-putty-300 cursor-pointer w-full gap-5 items-center hover:bg-tangaroa-900 hover:font-bold pt-3 pb-3 pl-5 transition-all duration-300 text-white"
        >
          <LogOut />
          <span className="text-[20px]">Cerrar Sesión</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
