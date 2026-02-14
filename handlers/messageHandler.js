import { db } from '../index.js';
import { commands } from './commandLoader.js';
import chalk from 'chalk';

const prefix = '.';
const ownerNumber = '2349040460676';

export async function handleMessage(sock, msg) {
    try {
        const messageType = Object.keys(msg.message)[0];
        const body = 
            messageType === 'conversation' ? msg.message.conversation :
            messageType === 'extendedTextMessage' ? msg.message.extendedTextMessage.text :
            messageType === 'imageMessage' ? msg.message.imageMessage.caption :
            messageType === 'videoMessage' ? msg.message.videoMessage.caption :
            '';

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const pushname = msg.pushName || 'User';

        // Check if message starts with prefix
        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Get user data
        const userId = sender.split('@')[0];
        let userData = (await db.ref(`users/${userId}`).once('value')).val();
        
        if (!userData) {
            userData = {
                name: pushname,
                balance: 0,
                bank: 0,
                orbs: 0,
                cards: [],
                inventory: {},
                registered: false,
                lastDaily: 0,
                warnings: 0
            };
            await db.ref(`users/${userId}`).set(userData);
        }

        // Check if command exists
        const command = commands.get(commandName);
        if (!command) return;

        // Permission checks
        const isOwner = userId === ownerNumber || sender === `${ownerNumber}@s.whatsapp.net`;
        let isMod = false;
        let isGuardian = false;
        let isAdmin = false;
        let isBotAdmin = false;

        if (isGroup) {
            const groupMetadata = await sock.groupMetadata(from);
            const participant = groupMetadata.participants.find(p => p.id === sender);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';

            // Check if bot is admin OR if the paired number (owner) is admin
            const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const botParticipant = groupMetadata.participants.find(p => p.id === botNumber);
            
            // Bot is considered admin if: bot account is admin OR owner/paired number is admin
            isBotAdmin = (botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin') || isOwner;

            const mods = (await db.ref('mods').once('value')).val() || [];
            const guardians = (await db.ref('guardians').once('value')).val() || [];
            
            isMod = mods.includes(userId);
            isGuardian = guardians.includes(userId);
        }

        // Check command permissions
        if (command.ownerOnly && !isOwner) {
            return await sock.sendMessage(from, { 
                text: '⚠️ This command is only for the bot owner!' 
            }, { quoted: msg });
        }

        if (command.modOnly && !isOwner && !isMod && !isGuardian) {
            return await sock.sendMessage(from, { 
                text: '⚠️ This command is only for moderators!' 
            }, { quoted: msg });
        }

        if (command.adminOnly && !isAdmin && !isOwner) {
            return await sock.sendMessage(from, { 
                text: '⚠️ This command is only for group admins!' 
            }, { quoted: msg });
        }

        if (command.groupOnly && !isGroup) {
            return await sock.sendMessage(from, { 
                text: '⚠️ This command can only be used in groups!' 
            }, { quoted: msg });
        }

        // Log command usage
        console.log(chalk.cyan(`[COMMAND] ${commandName} by ${pushname} in ${isGroup ? 'group' : 'private'}`));

        // Execute command
        await command.execute(sock, msg, args, {
            from,
            sender,
            isGroup,
            pushname,
            isOwner,
            isMod,
            isGuardian,
            isAdmin,
            isBotAdmin,
            userData,
            userId,
            prefix
        });

    } catch (error) {
        console.error(chalk.red('Error in message handler:'), error);
        try {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ An error occurred while executing the command!' 
            }, { quoted: msg });
        } catch {}
    }
}
