/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import getDetailUser from "@/components/dashboard/getDetailUser";
import logoutUser from "@/components/dashboard/logout";
import Cookies from "js-cookie";
import { User } from "@prisma/client";
import Chat from "./Chat";

export default function DashboardPage() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [opacity, setOpacity] = useState(0);
  const { setTheme } = useTheme();
  const token = Cookies.get("userToken");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (token) {
          const response = await getDetailUser(token);
          if (response) {
            setUser(response);
          } else {
            console.error("Gagal mengambil data pengguna", response);
          }
        }
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
      }
    };
    fetchUser();

    const timer = setTimeout(() => {
      setOpacity(100);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const logout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      if (token) {
        const response = await logoutUser(token);
        if (response) {
          toast.warn("Anda Telah Keluar, Silahkan Login Kembali", {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          });
          Cookies.remove("userToken");
          setTimeout(() => {
            setOpacity(0);
            setTimeout(() => {
              router.push("/");
            }, 500);
          }, 1000);
        } else {
          console.error("Gagal logout");
        }
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
    }
  };

  const linkdevce = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setOpacity(0);
    router.push("/device");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div
        className={`min-h-screen bg-white dark:bg-background transition-opacity duration-500 opacity-${opacity}`}
      >
        <nav className="border-gray-900 bg-green-200 dark:border-gray-200 dark:bg-gray-900">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <Link
              href="#"
              className="flex items-center space-x-3 rtl:space-x-reverse"
            >
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-black dark:text-white">
                Whatsapp Tools
              </span>
            </Link>
            <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
              <div className="relative">
                <button
                  type="button"
                  className="flex text-sm text-black dark:text-white bg-transparent rounded-full md:me-0 focus:ring-4 focus:ring-gray-600"
                  id="user-menu-button"
                  aria-expanded={isDropdownOpen}
                  onClick={toggleDropdown}
                >
                  <span className="sr-only">Open user menu</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 z-50 mt-2 w-48 text-base list-none divide-y rounded-lg shadow bg-indigo-500 dark:bg-gray-700 dark:divide-gray-600"
                    id="user-dropdown"
                  >
                    <div className="px-4 py-3">
                      <span className="block text-sm text-slate-100 dark:text-white">
                        {user ? user.name : "Memuat..."}
                      </span>
                      <span className="block text-sm truncate text-slate-300 dark:text-slate-400">
                        {user ? user.email : "Memuat..."}
                      </span>
                    </div>
                    <ul className="py-2" aria-labelledby="user-menu-button">
                      <li>
                        <Link
                          href="/device"
                          className="block px-4 py-2 text-sm hover:bg-gray-600 text-gray-200 hover:text-white"
                          onClick={linkdevce}
                        >
                          Link Device
                        </Link>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm hover:bg-gray-600 text-gray-200 hover:text-white"
                        >
                          Settings
                        </a>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="block px-4 py-2 text-sm hover:bg-gray-600 text-rose-500"
                          onClick={logout}
                        >
                          Sign out
                        </Link>
                      </li>
                      <li>
                        <div className="items-center text-center mt-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setTheme("light")}
                              >
                                Light
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setTheme("dark")}
                              >
                                Dark
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setTheme("system")}
                              >
                                System
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <button
                data-collapse-toggle="navbar-user"
                type="button"
                className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden focus:outline-none focus:ring-2 text-gray-400 hover:bg-gray-700 focus:ring-gray-600"
                aria-controls="navbar-user"
                aria-expanded={isSidebarOpen}
                onClick={toggleSidebar}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 17 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1h15M1 7h15M1 13h15"
                  />
                </svg>
              </button>
            </div>
            {isSidebarOpen && (
              <div
                className="items-center justify-between w-full md:flex md:w-auto md:order-1"
                id="navbar-user"
              >
                <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 bg-transparent md:bg-transparent border-gray-700">
                  <li>
                    <Link
                      href="#"
                      className="block py-2 px-3 text-black dark:text-white rounded md:bg-transparent md:p-0 dark:md:text-blue-500 md:text-violet-600"
                      aria-current="page"
                    >
                      Chat
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block py-2 px-3 rounded md:bg-transparent md:p-0 md:hover:text-blue-500 text-slate-700 dark:text-slate-300"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block py-2 px-3 rounded md:bg-transparent md:p-0 md:hover:text-blue-500 text-slate-700 dark:text-slate-300"
                    >
                      Services
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block py-2 px-3 rounded md:bg-transparent md:p-0 md:hover:text-blue-500 text-slate-700 dark:text-slate-300"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="block py-2 px-3 rounded md:bg-transparent md:p-0 md:hover:text-blue-500 text-slate-700 dark:text-slate-300"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </nav>
        <main>
          <Chat />
        </main>
      </div>
    </>
  );
}
