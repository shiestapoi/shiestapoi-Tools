"use server"
import prisma from "@/lib/Prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export default async function ButtonDirrectServer() {
  const SECRET_KEY = process.env.ENCRYPT_SECRET_KEY || "mahirushiina";
  const generateKey = async (secret: string): Promise<Uint8Array> => {
    return new TextEncoder().encode(secret);
  };

  const thecookie = cookies().get("userToken");
  let isLoggedIn = false; 

  if (thecookie) {
    try {
      const { payload } = await jwtVerify(
        thecookie.value,
        await generateKey(SECRET_KEY)
      ) as { payload: { data: { id: string } } };
      const user = await prisma.user.findUnique({
        where: {
          id: payload.data.id,
        },
      });
      if (user) {
        if (user.tokenLogin == thecookie.value){
          isLoggedIn = true;
        } 
      }
    } catch (error) {
      // Handle error (e.g., invalid token)
      console.error(error); 
    }
  }

  return { isLoggedIn };
}
