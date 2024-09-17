import prisma from "@/lib/Prisma";
import bcrypt from "bcryptjs";

export const runCreateUser = async () => {
  const adminUser = await prisma.user.findFirst();

  // Jika tidak ada pengguna admin, buat secara otomatis
  if (!adminUser) {
    try {
      if (
        process.env.ADMIN_EMAIL &&
        process.env.ADMIN_NAME &&
        process.env.ADMIN_PASSWORD
      ) {
        await prisma.user.create({
          data: {
            email: process.env.ADMIN_EMAIL,
            name: process.env.ADMIN_NAME,
            password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
            role: "admin",
          },
        });
        console.log("Akun admin berhasil dibuat secara otomatis");
        return {
          success: true,
          message: "Akun admin berhasil dibuat secara otomatis",
          data: {
            email: process.env.ADMIN_EMAIL,
            name: process.env.ADMIN_NAME,
          },
        };
      } else {
        console.log("Gagal membuat akun admin: Variabel tidak terdefinisi");
        return {
          success: false,
          message: "Gagal membuat akun admin: Variabel tidak terdefinisi",
          data: null,
        };
      }
    } catch (error) {
      console.error("Gagal membuat akun admin:", error);
      return {
        success: false,
        message: "Gagal membuat akun admin: " + error,
        data: null,
      };
    }
  } else {
    return {
      success: false,
      message: "Akun admin sudah ada",
      data: null,
    };
  }
};
