"use client"
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import ButtonDirrect from "@/components/home/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const [opacity, setOpacity] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(100);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] transition-opacity duration-500 ${
        isAnimating ? "opacity-0" : ""
      }`}
      style={{
        background:
          "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/img/header.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: `${opacity}%`,
      }}
    >
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          src="/svg/whatsapp.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="mb-2 text-2xl font-bold">Welcome to WhatsApp Tools</h1>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
        <div onClick={() => {
          setIsAnimating(true);
          setOpacity(0);
        }}>
          <ButtonDirrect />
        </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </main>
    </div>
  );
}
