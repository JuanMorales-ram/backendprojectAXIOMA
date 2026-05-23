"use client";

import Image from "next/image";
import TextBox from "./components/TextBox";
import { useState } from "react";
import Button from "./components/Button";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from '../../lib/supabaseBrowser';
import { motion } from "framer-motion";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor ingresa email y contraseña");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const supabase = supabaseBrowser();
    const { error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    setLoading(false);
    
    if (authError) {
      setError("Email o contraseña incorrectos");
      return;
    }
    
    router.push("/main/dashboard");
  };

  return (
    <div className=" flex justify-center content-center items-center w-full h-screen bg-putty-50 ">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-120 p-10 bg-putty-100 shadow-lg rounded-xl flex flex-col items-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Image
            src="/login/logo.png"
            alt="Logo"
            width={1000}
            height={1000}
            className="w-34 mx-auto "
          ></Image>
        </motion.div>

        {/* <h1 className="text-tangaroa-950 mt-3 text-3xl text-center w-full ">
          Instituto Axioma
        </h1> */}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex flex-col mt-6  w-70   items-center "
        >
          <TextBox
            className="w-26 border-l-tangaroa-950 "
            label="Email*"
            type="email"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          ></TextBox>
          <TextBox
            className="w-26 mt-5 "
            label="Contraseña*"
            type="password"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => { if ((e as React.KeyboardEvent<HTMLInputElement>).key === 'Enter') handleLogin(); }}
          ></TextBox>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm mt-2 text-center"
            >
              {error}
            </motion.p>
          )}

          <Button className="!mt-9 mb-1" label={loading ? "Ingresando..." : "Iniciar sesión"} onClick={handleLogin} ></Button>
        </motion.div>
      </motion.div>
    </div>
  );
}


