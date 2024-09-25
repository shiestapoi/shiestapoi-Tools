"use server";
import prisma from "@/lib/Prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export default async function LoginValidate(
  email: string,
  password: string,
  rememberMe: boolean
) {
  const SECRET_KEY = process.env.ENCRYPT_SECRET_KEY || "mahirushiina";
  const generateKey = async (secret: string): Promise<Uint8Array> => {
    return new TextEncoder().encode(secret);
  };

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      // Check password
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (isPasswordCorrect) {
        // Passwords match, generate JWT
        const expirationTime = rememberMe ? "7d" : "2h";
        const jwt = await new SignJWT({ data: { id: user.id } })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime(expirationTime)
          .sign(await generateKey(SECRET_KEY));

        await prisma.user.update({
          where: { id: user.id },
          data: { tokenLogin: jwt },
        });
        return {
          success: true,
          message: "Login Berhasil",
          jwtData: jwt,
        };
      } else {
        return {
          success: false,
          message: "Password Salah!",
          data: null,
        };
      }
    } else {
      return {
        success: false,
        message: "User Tidak Di Temukan!",
        data: null,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Internal Error!",
      data: null,
    };
  }
}
