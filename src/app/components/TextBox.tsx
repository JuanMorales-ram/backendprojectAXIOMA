"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

interface TextBoxProps {
  label: string;
  value: string;
  type: string;
  className: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  name?: string;
  id?: string;
  placeholder?: string;
  iconUrl?: string;
  helperText?: string;
  large?: boolean;
}

export default function TextBox({
  label,
  value,
  type,
  className,
  onChange,
  onKeyDown,
  name,
  id,
  placeholder,
  iconUrl,
  helperText,
  large,
}: TextBoxProps) {
  const [text, setText] = useState(label);
  const [focus, setFocus] = useState(false);
  const handleFocus = () => {
    setFocus(true);
    if (label.includes("*")) {
      setText((prevText) => prevText.slice(0, -1));
    }
  };
  const handleBlur = () => {
    setFocus(false);
    if (label.includes("*")) {
      setTimeout(() => {
        setText(label);
      }, 100);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={
        "w-full flex flex-wrap justify-start content-start " + className
      }
    >
      {large ? (
        <>
          <motion.textarea
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={` flex flex-1 border ${
              large ? " h-full justify-start content-start items-start " : ""
            } flex-grow bg-tangaroa-50 placeholder:italic placeholder:text-tangaroa-600/60 border-tangaroa-950 peer  p-2 focus:outline-none text-tangaroa-950 focus:ring-1  focus:ring-tangaroa-600/60 order-34 rounded-sm transition-all `}
          />
        </>
      ) : (
        <>
          <motion.input
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={` flex flex-1 border ${
              large ? " h-full justify-start content-start items-start " : ""
            } flex-grow bg-tangaroa-50 placeholder:italic placeholder:text-tangaroa-600/60 border-tangaroa-950 peer  p-2 focus:outline-none text-tangaroa-950 focus:ring-1  focus:ring-tangaroa-600/60 order-34 ${
              iconUrl || helperText ? " rounded-r-sm " : "rounded-sm"
            } transition-all `}
          />
          {(iconUrl || helperText) && (
            <div className=" flex  justify-center content-center bg-tangaroa-800  order-2 rounded-l-sm  ">
              {helperText && (
                <p className=" flex justify-center items-center px-3 ">
                  {helperText}
                </p>
              )}
              {iconUrl && (
                <p className=" flex justify-center items-center p-2 ">
                  <Image
                    src={iconUrl}
                    alt=" "
                    width={100}
                    height={100}
                    className=" w-6 h-auto  aspect-square"
                  ></Image>
                </p>
              )}
            </div>
          )}
        </>
      )}

      <label
        htmlFor={id}
        className=" w-full  h-fit m-0  text-left text-sm text-tangaroa-950 top-0 peer-focus:top-1 relative order-1 transition-all peer-focus:ml-1 peer-focus:text-tangaroa-950 peer-focus:font-medium   "
      >
        <span
          className={` bg-putty-100 transition-all  ${
            focus ? "shadow-sm px-1 rounded-sm" : ""
          }`}
        >
          {" "}
          {text}
        </span>
      </label>
    </motion.div>
  );
}
