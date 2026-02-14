import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
    name: 'take',
    description: 'Change sticker pack name',
    execute: async (sock, msg, args, context) => {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted || !quoted.stickerMessage) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please reply to a sticker!\nUsage: .take <pack name> | <author>'
            }, { quoted: msg });
        }
        
        const text = args.join(' ');
        let packname = 'Nexora';
        let author = context.pushname;
        
        if (text.includes('|')) {
            const parts = text.split('|');
            packname = parts[0].trim() || 'Nexora';
            author = parts[1].trim() || context.pushname;
        } else if (text) {
            packname = text;
        }
        
        try {
            const media = await downloadMediaMessage(
                { message: { stickerMessage: quoted.stickerMessage } },
                'buffer',
                {}
            );
            
            await sock.sendMessage(context.from, {
                sticker: media,
                packname: packname,
                author: author
            }, { quoted: msg });
            
        } catch (error) {
            console.error('Take sticker error:', error);
            await sock.sendMessage(context.from, {
                text: '❌ Failed to modify sticker!'
            }, { quoted: msg });
        }
    }
};
