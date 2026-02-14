import { db } from '../../index.js';

export default {
    name: 'removeguardian',
    aliases: ['delguardian'],
    description: 'Remove a guardian',
    ownerOnly: true,
    execute: async (sock, msg, args, context) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        
        if (!mentioned || mentioned.length === 0) {
            return await sock.sendMessage(context.from, { 
                text: '⚠️ Please mention a user to remove from guardians!' 
            }, { quoted: msg });
        }

        const userId = mentioned[0].split('@')[0];
        let guardians = (await db.ref('guardians').once('value')).val() || [];

        if (!guardians.includes(userId)) {
            return await sock.sendMessage(context.from, { 
                text: '⚠️ This user is not a guardian!' 
            }, { quoted: msg });
        }

        guardians = guardians.filter(g => g !== userId);
        await db.ref('guardians').set(guardians);

        await sock.sendMessage(context.from, { 
            text: `✅ Successfully removed @${userId} from guardians!`,
            mentions: [mentioned[0]]
        }, { quoted: msg });
    }
};
