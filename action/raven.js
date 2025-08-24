const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, getBinaryNodeChild, getBinaryNodeChildren, prepareWAMessageMedia, areJidsSameUser, getContentType } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require('path');
const chalk = require("chalk");
const speed = require("performance-now");

// gcname enabled/disabled global variable
global.gcnameActive = true;

module.exports = raven = async (client, m, chatUpdate, store) => {
  try {
    const { prefix, mode, gptdm } = await require('../Database/fetchSettings')();

    const body = (m.mtype === "conversation" ? m.message.conversation
      : m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text
      : m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId
      : m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId
      : m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId
      : "") || "";

    const command = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : "";
    const args = body.trim().split(/ +/).slice(1);

    const isGroup = m.isGroup;
    const groupMetadata = isGroup ? await client.groupMetadata(m.chat).catch(() => null) : null;
    const botNumber = await client.decodeJid(client.user.id);
    const sender = m.sender;
    const adminList = isGroup && groupMetadata ? groupMetadata.participants.filter(p => p.admin).map(p => p.id) : [];
    const isAdmin = isGroup ? adminList.includes(sender) : false;
    const isBotAdmin = isGroup ? adminList.includes(botNumber) : false;
    // Owner number list – edit here for your real WhatsApp number(s)
    const ownerNumbers = ["918302965383@s.whatsapp.net"];
    const isOwner = ownerNumbers.includes(sender);

    if (!command) return;

    // ------------ Command Handler ------------
    switch (command) {
      case "gcname":
        if (!isGroup) return m.reply("Ye command sirf group me chalti hai.");
        if (!isAdmin && !isBotAdmin && !isOwner) return m.reply("Sirf group admin, bot admin ya owner use kar sakta hai.");
        if (!global.gcnameActive) return m.reply('GC name change ab disabled hai. "start" se enable karo.');
        const newName = args.join(" ");
        if (!newName) return m.reply("Naya group name likho. Example: gcname Vanshu on top 💋");
        if (newName.length > 25) return m.reply("Group name 25 characters se jyada nahi ho sakta.");
        await client.groupUpdateSubject(m.chat, newName);
        return m.reply(`Group name badal gaya: ${newName}`);

      case "stop":
        if (!isOwner) return m.reply("Sirf owner command use kar sakta hai.");
        global.gcnameActive = false;
        return m.reply("GC name change ab disable ho gaya.");

      case "start":
        if (!isOwner) return m.reply("Sirf owner command use kar sakta hai.");
        global.gcnameActive = true;
        return m.reply("GC name change ab enable ho gaya.");

      case "menu":
        return m.reply(`╭── Frost_Byte-Ai Commands ──
├ ✎ gcname <text> : Change group name
├ ✎ stop : Disable gcname command (Owner only)
├ ✎ start : Enable gcname command (Owner only)
╰────────────────────⭓
`);

      // Aur bhi commands yahan add kar sakte ho...
    }
  } catch (err) {
    console.error("Error in raven handler:", err);
    m.reply("❌ Internal error!");
  }
};
