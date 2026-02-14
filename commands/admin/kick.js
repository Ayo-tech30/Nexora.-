export default {
    name: 'kick',
    description: 'Kick a member from group',
    adminOnly: true,
    groupOnly: true,
    execute: async (sock, msg, args, context) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        
        if (!mentioned || mentioned.length === 0) {
            return await sock.sendMessage(context.from, { 
                text: '⚠️ Please mention user(s) to kick!' 
            }, { quoted: msg });
        }

        if (!context.isBotAdmin) {
            return await sock.sendMessage(context.from, { 
                text: '⚠️ Bot needs admin rights to kick members!' 
            }, { quoted: msg });
        }

        try {
            await sock.groupParticipantsUpdate(context.from, mentioned, 'remove');
            await sock.sendMessage(context.from, { 
                text: `✅ Successfully kicked ${mentioned.length} member(s)!` 
            }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(context.from, { 
                text: `❌ Failed to kick: ${error.message}` 
            }, { quoted: msg });
        }
    }
};
