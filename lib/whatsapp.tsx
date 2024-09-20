/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = Infinity;
import prisma from "./Prisma";
import NodeCache from "node-cache";
import { Boom } from "@hapi/boom";
import P from "pino";
import qrcode from "qrcode";
import fs from "fs/promises";
import path from "path";
import makeWASocket, {
  WASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  makeInMemoryStore,
  proto,
  ConnectionState,
  useMultiFileAuthState,
  WAMessageContent,
  WAMessageKey,
  BaileysEventMap,
  downloadMediaMessage,
} from "@whiskeysockets/baileys";
import chalk from "chalk";
import { smsg } from "./myFunc";

const logFilePath = './temp/wa-logs.txt';

// Pastikan direktori temp ada
fs.mkdir(path.dirname(logFilePath), { recursive: true })
  .then(() => {
    // Baca file log jika ada
    fs.access(logFilePath, fs.constants.F_OK)
      .then(() => {
        console.log('File log ada');
      })
      .catch(() => {
        console.log('File log tidak ada, akan dibuat saat penyimpanan pertama');
      });
  })
  .catch((err) => {
    console.error('Gagal membuat direktori temp:', err);
  });

const logger = P(
  { timestamp: () => `,"time":"${new Date().toJSON()}"` },
  P.destination(logFilePath)
);
logger.level = "trace";
const msgRetryCounterCache = new NodeCache();

export const whatsappEmitter = new EventEmitter();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sock: any;
const store = makeInMemoryStore({ logger });
const storeFilePath = "./temp/baileys_store_multi.json";

// Pastikan direktori temp ada
fs.mkdir(path.dirname(storeFilePath), { recursive: true })
  .then(() => {
    // Baca file store jika ada
    fs.access(storeFilePath, fs.constants.F_OK)
      .then(() => {
        store?.readFromFile(storeFilePath);
      })
      .catch(() => {
        console.log('File store tidak ada, akan dibuat saat penyimpanan pertama');
      });

    // Simpan setiap 10 detik
    setInterval(() => {
      store?.writeToFile(storeFilePath);
    }, 10_000);
  })
  .catch((err) => {
    console.error('Gagal membuat direktori temp:', err);
  });

async function deleteAuthInfo() {
  try {
    await fs.rm(path.join(process.cwd(), "auth_info"), {
      recursive: true,
      force: true,
    });
    console.log("Auth info berhasil dihapus");
  } catch (error) {
    console.error("Gagal menghapus auth info:", error);
  }
}

export async function connectToWhatsApp(): Promise<{
  qr?: string;
  newStatus?: string;
}> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version, isLatest } = await fetchLatestBaileysVersion();

  whatsappEmitter.emit(
    "version",
    `using WA v${version.join(".")}, isLatest: ${isLatest}`
  );
  sock = makeWASocket({
    version,
    logger,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
    getMessage,
    printQRInTerminal: false,
    browser: Browsers.macOS("Desktop"),
    syncFullHistory: true,
  });

  store.bind(sock.ev);
  return new Promise(async (resolve) => {
    sock!.ev.on(
      "connection.update",
      async (update: Partial<ConnectionState>) => {
        const { connection, qr, lastDisconnect } = update;
        if (qr) {
          const qrCode = await qrcode.toDataURL(qr);
          whatsappEmitter.emit("qrCode", qrCode);
          resolve({ qr: qrCode });
        }
        if (connection === "close") {
          // Reconnect jika tidak logged out
          if (
            (lastDisconnect?.error as Boom)?.output?.statusCode !==
            DisconnectReason.loggedOut
          ) {
            whatsappEmitter.emit("connectionStatus", "reconnecting");
            whatsappEmitter.emit("numberPhoneConnection", null);
            setTimeout(() => {
              connectToWhatsApp();
            }, 5000);
          } else {
            console.log("Koneksi terputus. Anda telah keluar.");
            await deleteAuthInfo();
            whatsappEmitter.emit("connectionStatus", "logged_out");
          }
        } else if (connection === "open") {
          const nomorBot = sock.user.id.split(":")[0] + "@s.whatsapp.net";
          whatsappEmitter.emit("connectionStatus", "open");
          whatsappEmitter.emit("numberPhoneConnection", nomorBot);
        }
      }
    );

    sock!.ev.on("creds.update", saveCreds);
    sock!.ev.on(
      "messaging-history.set",
      (
        chats: any,
        contacts: any,
        messages: any,
        isLatest: any,
        progress: any,
        syncType: any
      ) => {
        if (syncType === proto.HistorySync.HistorySyncType.ON_DEMAND) {
          console.log("received on-demand history sync, messages=", messages);
        }
      }
    );

    sock!.ev.on(
      "messages.upsert",
      async (messageUpdate: BaileysEventMap["messages.upsert"]) => {
        const message = messageUpdate.messages[0];
        if (!message.message) return;
        message.message =
          Object.keys(message.message)[0] === "ephemeralMessage"
            ? message.message.ephemeralMessage?.message
            : message.message;
        if (message.key && message.key.remoteJid === "status@broadcast") return;
        if (
          message.key &&
          message.key.id?.startsWith("BAE5") &&
          message.key.id?.length === 16
        )
          return;
        const m = smsg({ conn: sock, m: message, store });
        console.log(
          chalk.black(chalk.bgWhite("[ PESAN ]")),
          chalk.black(chalk.bgGreen(new Date())),
          chalk.black(chalk.bgBlue(m.body)) + "\n" + chalk.magenta("=> Dari"),
          chalk.green(m.pushName),
          chalk.yellow(m.sender) + "\n" + chalk.blueBright("=> Di"),
          chalk.green(m.isGroup ? m.pushName : "Private Chat", m.chat)
        );
        console.log(m)
        console.log("=============================")
        console.log(messageUpdate.messages[0])
        console.log("=============================")
        whatsappEmitter.emit("newMessage", message);
        // Simpan pesan ke database jika diperlukan
        const chat = await prisma.chatSetting.findFirst({
          where: {
            chatObjectid: m.chat,
          },
        });

        if (chat?.backup) {
          if(m.mtype == 'conversation' || m.mtype == 'extendedTextMessage') {
            await prisma.chat.create({
              data: {
                chatId: m.key,
                nameContact: m.pushName || m.sender,
                chatObjectid: m.chat,
                message: m.body,
                mediaUrl: m.mediaUrl || null,
                timestamp: new Date(),
                backup: true,
                messageType: m.mtype,
                pesanPrivate: m.isGroup ? false : true,
                mediaFile: m.mediaFile ? await fs.readFile(m.mediaFile) : null,
              },
            });
          } else if (m.mtype == 'imageMessage' || m.mtype == 'audioMessage' || m.mtype == 'videoMessage' || m.mtype == 'stickerMessage') {
            const buffer = await downloadMediaMessage(
              messageUpdate.messages[0],
              'buffer',
              { },
              {
                  logger,
                  reuploadRequest: sock.updateMediaMessage
              }
            )
            const sender = m.sender;
            const number = sender.split('@')[0];
            let namefolder;
            let mimetype;
            if(m.mtype == 'imageMessage'){
              mimetype = m.message.imageMessage.mimetype.split('/')[1];
              namefolder = 'image'
            } else if (m.mtype == 'audioMessage') {
              mimetype = m.message.audioMessage.mimetype.split('/')[1].split(';')[0];
              namefolder = 'audio'
            } else if (m.mtype == 'videoMessage'){
              mimetype = m.message.videoMessage.mimetype.split('/')[1];
              namefolder = 'video'
            } else if (m.mtype == 'stickerMessage'){
              mimetype = m.message.stickerMessage.mimetype.split('/')[1];
              namefolder = 'sticker'
            } else {
              namefolder = 'temp'
            }
            const locationFile = `/whatsapp/media/${namefolder}/${m.id}${number}.${mimetype}`;
            const absoluteFilePath = path.join(process.cwd(), "public", locationFile);
            console.log(absoluteFilePath)
            const dirPath = path.dirname(absoluteFilePath);
            await fs.mkdir(dirPath, { recursive: true });
            fs.writeFile(absoluteFilePath, buffer)
            let mediaFile = null;
            const stats = await fs.stat(absoluteFilePath);
            if (stats.size <= 5 * 1024 * 1024) {
                mediaFile = await fs.readFile(absoluteFilePath);
            }
            await prisma.chat.create({
              data: {
                chatId: m.key,
                nameContact: m.pushName || m.sender,
                chatObjectid: m.chat,
                message: m.body === undefined ? "" : m.body,
                mediaUrl: locationFile,
                timestamp: new Date(),
                backup: true,
                messageType: m.mtype,
                pesanPrivate: m.isGroup ? false : true,
                mediaFile: mediaFile,
              },
            });
          } else if (m.mtype == 'messageContextInfo'){
            if (m.message && m.message.viewOnceMessage && m.message.viewOnceMessage.message) {
              console.log(m.message.viewOnceMessage.message);
                const buffer = await downloadMediaMessage(
                  messageUpdate.messages[0],
                  'buffer',
                  { },
                  {
                      logger,
                      reuploadRequest: sock.updateMediaMessage
                  }
                )
                const sender = m.sender;
                const number = sender.split('@')[0];
                let namefolder;
                let mimetype;
                let message;
                if(m.message.viewOnceMessage.message.imageMessage.mimetype){
                  mimetype = m.message.viewOnceMessage.message.imageMessage.mimetype.split('/')[1];
                  namefolder = 'image'
                  message = m.message.viewOnceMessage.message.imageMessage.caption
                } else if (m.message.viewOnceMessage.message.audioMessage.mimetype) {
                  mimetype = m.message.viewOnceMessage.message.audioMessage.mimetype.split('/')[1].split(';')[0];
                  namefolder = 'audio'
                  message = m.message.viewOnceMessage.message.audioMessage.caption
                } else if (m.message.viewOnceMessage.message.videoMessage.mimetype){
                  mimetype = m.message.viewOnceMessage.message.videoMessage.mimetype.split('/')[1];
                  namefolder = 'video'
                  message = m.message.viewOnceMessage.message.videoMessage.caption
                } else if (m.message.viewOnceMessage.message.stickerMessage.mimetype){
                  mimetype = m.message.viewOnceMessage.message.stickerMessage.mimetype.split('/')[1];
                  namefolder = 'sticker'
                  message = m.message.viewOnceMessage.message.stickerMessage.caption
                } else {
                  namefolder = 'temp'
                }
                const locationFile = `/whatsapp/media/${namefolder}/${m.id}${number}.${mimetype}`;
                const absoluteFilePath = path.join(process.cwd(), "public", locationFile);
                const dirPath = path.dirname(absoluteFilePath);
                await fs.mkdir(dirPath, { recursive: true });
                fs.writeFile(absoluteFilePath, buffer)
                let mediaFile = null;
                const stats = await fs.stat(absoluteFilePath);
                if (stats.size <= 5 * 1024 * 1024) {
                    mediaFile = await fs.readFile(absoluteFilePath);
                }
                await prisma.chat.create({
                  data: {
                    chatId: m.key,
                    nameContact: m.pushName || m.sender,
                    chatObjectid: m.chat,
                    message: message ? message : "",
                    mediaUrl: locationFile,
                    timestamp: new Date(),
                    backup: true,
                    messageType: m.mtype,
                    pesanPrivate: m.isGroup ? false : true,
                    mediaFile: mediaFile,
                  },
                });
            } else if (m.message && m.message.viewOnceMessage && m.message.viewOnceMessage.message) {
              console.log(m.message.viewOnceMessage.message);
                const buffer = await downloadMediaMessage(
                  messageUpdate.messages[0],
                  'buffer',
                  { },
                  {
                      logger,
                      reuploadRequest: sock.updateMediaMessage
                  }
                )
                const sender = m.sender;
                const number = sender.split('@')[0];
                let namefolder;
                let mimetype;
                let message;
                if(m.message.viewOnceMessage.message.imageMessage.mimetype){
                  mimetype = m.message.viewOnceMessage.message.imageMessage.mimetype.split('/')[1];
                  namefolder = 'image'
                  message = m.message.viewOnceMessage.message.imageMessage.caption
                } else if (m.message.viewOnceMessage.message.audioMessage.mimetype) {
                  mimetype = m.message.viewOnceMessage.message.audioMessage.mimetype.split('/')[1].split(';')[0];
                  namefolder = 'audio'
                  message = m.message.viewOnceMessage.message.audioMessage.caption
                } else if (m.message.viewOnceMessage.message.videoMessage.mimetype){
                  mimetype = m.message.viewOnceMessage.message.videoMessage.mimetype.split('/')[1];
                  namefolder = 'video'
                  message = m.message.viewOnceMessage.message.videoMessage.caption
                } else if (m.message.viewOnceMessage.message.stickerMessage.mimetype){
                  mimetype = m.message.viewOnceMessage.message.stickerMessage.mimetype.split('/')[1];
                  namefolder = 'sticker'
                  message = m.message.viewOnceMessage.message.stickerMessage.caption
                } else {
                  namefolder = 'temp'
                }
                const locationFile = `/whatsapp/media/${namefolder}/${m.id}${number}.${mimetype}`;
                const absoluteFilePath = path.join(process.cwd(), "public", locationFile);
                const dirPath = path.dirname(absoluteFilePath);
                await fs.mkdir(dirPath, { recursive: true });
                fs.writeFile(absoluteFilePath, buffer)
                let mediaFile = null;
                const stats = await fs.stat(absoluteFilePath);
                if (stats.size <= 5 * 1024 * 1024) {
                    mediaFile = await fs.readFile(absoluteFilePath);
                }
                await prisma.chat.create({
                  data: {
                    chatId: m.key,
                    nameContact: m.pushName || m.sender,
                    chatObjectid: m.chat,
                    message: message ? message : "",
                    mediaUrl: locationFile,
                    timestamp: new Date(),
                    backup: true,
                    messageType: m.mtype,
                    pesanPrivate: m.isGroup ? false : true,
                    mediaFile: mediaFile,
                  },
                });
            } else if (m.message && m.message.documentWithCaptionMessage && m.message.documentWithCaptionMessage.message) {
              console.log(m.message.documentWithCaptionMessage.message);
              const buffer = await downloadMediaMessage(
                messageUpdate.messages[0],
                'buffer',
                { },
                {
                    logger,
                    reuploadRequest: sock.updateMediaMessage
                }
              )
              const sender = m.sender;
              const number = sender.split('@')[0];
              const locationFile = `/whatsapp/media/document/${m.message.documentWithCaptionMessage.message.documentMessage.fileName}`;
              const absoluteFilePath = path.join(process.cwd(), "public", locationFile);
              const dirPath = path.dirname(absoluteFilePath);
              await fs.mkdir(dirPath, { recursive: true });
              fs.writeFile(absoluteFilePath, buffer)
              let mediaFile = null;
              const stats = await fs.stat(absoluteFilePath);
              if (stats.size <= 5 * 1024 * 1024) {
                  mediaFile = await fs.readFile(absoluteFilePath);
              }
              await prisma.chat.create({
                data: {
                  chatId: m.key,
                  nameContact: m.pushName || m.sender,
                  chatObjectid: m.chat,
                  message: m.message.documentWithCaptionMessage.message.documentMessage.caption,
                  mediaUrl: locationFile,
                  timestamp: new Date(),
                  backup: true,
                  messageType: m.mtype,
                  pesanPrivate: m.isGroup ? false : true,
                  mediaFile: mediaFile,
                },
              });
            } else {
                console.log('No viewOnceMessage found.');
            }
          } else if (m.mtype == 'documentMessage'){
            const buffer = await downloadMediaMessage(
              messageUpdate.messages[0],
              'buffer',
              { },
              {
                  logger,
                  reuploadRequest: sock.updateMediaMessage
              }
            )
            const sender = m.sender;
            const number = sender.split('@')[0];
            const locationFile = `/public/whatsapp/media/document/${m.message.documentMessage.fileName}`;
            const absoluteFilePath = path.join(process.cwd(), locationFile);
            const dirPath = path.dirname(absoluteFilePath);
            await fs.mkdir(dirPath, { recursive: true });
            fs.writeFile(absoluteFilePath, buffer)
            let mediaFile = null;
            const stats = await fs.stat(absoluteFilePath);
            if (stats.size <= 5 * 1024 * 1024) {
                mediaFile = await fs.readFile(absoluteFilePath);
            }
            await prisma.chat.create({
              data: {
                chatId: m.key,
                nameContact: m.pushName || m.sender,
                chatObjectid: m.chat,
                message: m.message.documentMessage.caption,
                mediaUrl: locationFile,
                timestamp: new Date(),
                backup: true,
                messageType: m.mtype,
                pesanPrivate: m.isGroup ? false : true,
                mediaFile: mediaFile,
              },
            });
          }
        }
        store.chats.all();
      }
    );

    sock!.ev.on("contacts.upsert", () => {
      console.log("got contacts", Object.values(store.contacts));
    });
  });
}

// export async function toggleBackup(
//   chatId: string
// ): Promise<{ status: string }> {
//   const chat = await prisma.chat.findFirst({
//     where: { chatId },
//   });
//   if (chat) {
//     await prisma.chat.update({
//       where: { id: chat.id },
//       data: { backup: !chat.backup },
//     });
//   } else {
//     await prisma.chat.create({
//       data: {
//         chatId: chatId,
//         nameContact: chatId,
//         backup: true,
//         message: "",
//         pesanPrivate: true,
//         timestamp: new Date(),
//         messageType: "text",
//       },
//     });
//   }
//   return { status: "Status backup diubah" };
// }

async function getMessage(
  key: WAMessageKey
): Promise<WAMessageContent | undefined> {
  if (store) {
    const msg = await store.loadMessage(key.remoteJid!, key.id!);
    return msg?.message || undefined;
  }

  // only if store is present
  return proto.Message.fromObject({});
}

export function getSocket(): WASocket | null {
  console.log("Current sock state:", sock);
  if (sock === null) {
    console.log("Socket is null. Attempting to reconnect...");
    connectToWhatsApp();
  }
  return sock;
}
