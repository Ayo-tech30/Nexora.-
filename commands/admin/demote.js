export default {
    name: 'demote',
    description: 'Demote an admin to member',
    adminOnly: true,
    groupOnly: true,
    execute: async (sock, msg, args, context) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        
        if (!mentioned || mentioned.length === 0) {
            return await sock.sendMessage(context.from, { 
                text: '⚠️ Please mention user(s) to demote!' 
            }, { quoted: msg });
        }

        if (!context.isBotAdmin) {
            return await sock.sendMessage(context.from, { 
                text: '⚠️ Bot needs admin rights to demote members!' 
            }, { quoted: msg });
        }

        try {
            await sock.groupParticipantsUpdate(context.from, mentioned, 'demote');
            await sock.sendMessage(context.from, { 
                text: `✅ Successfully demoted ${mentioned.length} admin(s) to member!` 
            }, { quoted: msg });
        } catch (error) {
            await sock.sendMessage(context.from, { 
                text: `❌ Failed to demote: ${error.message}` 
            }, { quoted: msg });
        }
    }
};
