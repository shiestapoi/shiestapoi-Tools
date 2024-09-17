"use server";
import prisma from "@/lib/Prisma";
import { jwtVerify } from "jose";

export default async function getDetailUser(token: string) {
  const SECRET_KEY = process.env.ENCRYPT_SECRET_KEY || "mahirushiina";
  const generateKey = async (secret: string): Promise<Uint8Array> => {
    return new TextEncoder().encode(secret);
  };

  try {
    const { payload } = await jwtVerify(token, await generateKey(SECRET_KEY));
    const toJson1 = JSON.parse(JSON.stringify(payload));
    const id = toJson1?.data?.id;
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    if (!user) return null;
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Internal Error!",
      data: null,
    };
  }
}
