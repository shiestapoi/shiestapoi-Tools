/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = "force-dynamic";

import React from "react";
import { proto } from "@whiskeysockets/baileys";
import axios, { AxiosRequestConfig } from "axios";
import moment from "moment-timezone";
import { sizeFormatter } from "human-readable";
import util from "util";
import Jimp from "jimp";

const unixTimestampSeconds = (date: Date = new Date()): number =>
  Math.floor(date.getTime() / 1000);

export const generateMessageTag = (epoch?: number): string => {
  let tag = unixTimestampSeconds().toString();
  if (epoch) tag += ".--" + epoch;
  return tag;
};

export const processTime = (timestamp: number, now: number): number => {
  return moment.duration(now - moment(timestamp * 1000).valueOf()).asSeconds();
};

export const getRandom = (ext: string): string => {
  return `${Math.floor(Math.random() * 10000)}${ext}`;
};

export const getBuffer = async (
  url: string,
  options?: AxiosRequestConfig
): Promise<Buffer> => {
  try {
    const res = await axios({
      method: "get",
      url,
      headers: {
        DNT: 1,
        "Upgrade-Insecure-Request": 1,
      },
      ...options,
      responseType: "arraybuffer",
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const fetchJson = async (
  url: string,
  options?: AxiosRequestConfig
): Promise<any> => {
  try {
    const res = await axios({
      method: "GET",
      url: url,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
      },
      ...options,
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const runtime = (seconds: number): string => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
};

export const clockString = (ms: number): string => {
  const h = isNaN(ms) ? "--" : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
};

export const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const isUrl = (url: string): boolean => {
  return !!url.match(
    new RegExp(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/,
      "gi"
    )
  );
};

export const getTime = (format: string, date?: Date | number): string => {
  if (date) {
    return moment(date).locale("id").format(format);
  } else {
    return moment.tz("Asia/Jakarta").locale("id").format(format);
  }
};

export const formatDate = (n: number | Date, locale: string = "id"): string => {
  const d = new Date(n);
  return d.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
};

export const tanggal = (numer: number): string => {
  const myMonths = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const myDays = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jum'at",
    "Sabtu",
  ];
  const tgl = new Date(numer);
  const day = tgl.getDate();
  const bulan = tgl.getMonth();
  const thisDay = myDays[tgl.getDay()];
  const year = tgl.getFullYear();
  const d = new Date();
  const gmt =
    new Date(0).getTime() - new Date("1970-01-01T00:00:00Z").getTime();
  const weton = ["Pahing", "Pon", "Wage", "Kliwon", "Legi"][
    Math.floor((d.getTime() * 1 + gmt) / 84600000) % 5
  ];

  return `${thisDay}, ${day} - ${myMonths[bulan]} - ${year} ${weton}`;
};

export const formatp = sizeFormatter({
  std: "JEDEC",
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

export const jsonformat = (string: any): string => {
  return JSON.stringify(string, null, 2);
};

export const logic = (check: any, inp: any[], out: any[]): any => {
  if (inp.length !== out.length)
    throw new Error("Input and Output must have same length");
  for (const i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i];
  return null;
};

export const generateProfilePicture = async (
  buffer: Buffer
): Promise<{ img: Buffer; preview: Buffer }> => {
  const jimp = await Jimp.read(buffer);
  const min = jimp.getWidth();
  const max = jimp.getHeight();
  const cropped = jimp.crop(0, 0, min, max);
  return {
    img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
    preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
  };
};

export const bytesToSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const getSizeMedia = (path: string | Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (/http/.test(path as string)) {
      axios.get(path as string).then((res) => {
        const length = parseInt(res.headers["content-length"]);
        const size = exports.bytesToSize(length, 3);
        if (!isNaN(length)) resolve(size);
      });
    } else if (Buffer.isBuffer(path)) {
      const length = Buffer.byteLength(path);
      const size = exports.bytesToSize(length, 3);
      if (!isNaN(length)) resolve(size);
    } else {
      reject("error gatau apah");
    }
  });
};

export const parseMention = (text: string = ""): string[] => {
  const matches = text.matchAll(/@([0-9]{5,16}|0)/g);
  return Array.from(matches).map((v) => v[1] + "@s.whatsapp.net");
};

interface ISmsg {
  conn: any;
  m: any;
  store: any;
}

export const smsg = ({ conn, m, store }: ISmsg): any => {
  if (!m) return m;
  const M = proto.WebMessageInfo;
  if (m.key) {
    m.id = m.key.id;
    m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith("@g.us");
    m.sender = jidNormalizedUser(
      (m.fromMe && conn.user.id) ||
        m.participant ||
        m.key.participant ||
        m.chat ||
        ""
    );
    if (m.isGroup)
      m.participant =
        jidNormalizedUser(conn.decodeJid(m.key.participant)) || "";
  }
  if (m.message) {
    m.mtype = Object.keys(m.message)[0];
    m.msg = m.message[m.mtype];
    if (m.mtype === "ephemeralMessage") {
      m.mtype = Object.keys(m.message.ephemeralMessage.message)[0];
      m.msg = m.message.ephemeralMessage.message[m.mtype];
    }
    if (m.mtype === "viewOnceMessage") {
      m.mtype = Object.keys(m.message.viewOnceMessage.message)[0];
      m.msg = m.message.viewOnceMessage.message[m.mtype];
    }
    m.body =
      m.message.conversation ||
      m.msg.caption ||
      m.msg.text ||
      (m.mtype == "listResponseMessage" &&
        m.msg.singleSelectReply.selectedRowId) ||
      (m.mtype == "buttonsResponseMessage" && m.msg.selectedButtonId) ||
      (m.mtype == "viewOnceMessage" && m.msg.caption) ||
      m.text;
    const quoted = (m.quoted = m.msg.contextInfo
      ? m.msg.contextInfo.quotedMessage
      : null);
    m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
    if (m.quoted) {
      let type = Object.keys(m.quoted)[0];
      m.quoted = m.quoted[type];
      if (["productMessage"].includes(type)) {
        type = Object.keys(m.quoted)[0];
        m.quoted = m.quoted[type];
      }
      if (typeof m.quoted === "string")
        m.quoted = {
          text: m.quoted,
        };
      m.quoted.mtype = type;
      m.quoted.id = m.msg.contextInfo.stanzaId;
      m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
      m.quoted.isBaileys = m.quoted.id
        ? m.quoted.id.startsWith("BAE5") && m.quoted.id.length === 16
        : false;
      m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant);
      m.quoted.fromMe = m.quoted.sender === (conn.user && conn.user.id);
      m.quoted.text =
        m.quoted.text ||
        m.quoted.caption ||
        m.quoted.conversation ||
        m.quoted.contentText ||
        m.quoted.selectedDisplayText ||
        m.quoted.title ||
        "";
      m.quoted.mentionedJid = m.msg.contextInfo
        ? m.msg.contextInfo.mentionedJid
        : [];
      m.getQuotedObj = m.getQuotedMessage = async () => {
        if (!m.quoted.id) return false;
        const q = await store.loadMessage(m.chat, m.quoted.id, conn);
        return exports.smsg(conn, q, store);
      };
      const vM = (m.quoted.fakeObj = M.fromObject({
        key: {
          remoteJid: m.quoted.chat,
          fromMe: m.quoted.fromMe,
          id: m.quoted.id,
        },
        message: quoted,
        ...(m.isGroup ? { participant: m.quoted.sender } : {}),
      }));
      m.quoted.delete = () =>
        conn.sendMessage(m.quoted.chat, { delete: vM.key });
      m.quoted.copyNForward = (
        jid: string,
        forceForward: boolean = false,
        options: any = {}
      ) => conn.copyNForward(jid, vM, forceForward, options);
      m.quoted.download = () => conn.downloadMediaMessage(m.quoted);
    }
  }
  if (m.msg.url) m.download = () => conn.downloadMediaMessage(m.msg);
  m.text =
    m.msg.text ||
    m.msg.caption ||
    m.message.conversation ||
    m.msg.contentText ||
    m.msg.selectedDisplayText ||
    m.msg.title ||
    "";
  m.reply = (text: string, chatId: string = m.chat, options: any = {}) =>
    Buffer.isBuffer(text)
      ? conn.sendMedia(chatId, text, "file", "", m, { ...options })
      : conn.sendText(chatId, text, m, { ...options });
  m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)));
  m.copyNForward = (
    jid: string = m.chat,
    forceForward: boolean = false,
    options: any = {}
  ) => conn.copyNForward(jid, m, forceForward, options);
  return m;
};

const jidNormalizedUser = (jid: string): string => {
  if (!jid) return jid;
  if (/:\d+@/gi.test(jid)) {
    const [username, server] = jid.split("@");
    return username.split(":")[0] + "@" + server;
  }
  return jid;
};

// React component
const Utils: React.FC = () => {
  return (
    <div>
      <h1>Utils Component</h1>
      <p>
        This component doesn&apos;t render anything visible. It exports utility
        functions for use in other parts of the application.
      </p>
    </div>
  );
};

export default Utils;
