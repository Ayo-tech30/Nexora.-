import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export default {
    name: 'toimg',
    description: 'Convert sticker to image',
    execute: async (sock, msg, args, context) => {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted || !quoted.stickerMessage) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please reply to a sticker!\nUsage: Reply to sticker with .toimg'
            }, { quoted: msg });
        }
        
        try {
            const media = await downloadMediaMessage(
                { message: { stickerMessage: quoted.stickerMessage } },
                'buffer',
                {}
            );
            
            const tempFile = path.join('/tmp', `sticker_${Date.now()}.webp`);
            const outputFile = path.join('/tmp', `image_${Date.now()}.png`);
            
            fs.writeFileSync(tempFile, media);
            
            // Convert webp to png
            await execPromise(`ffmpeg -i ${tempFile} ${outputFile}`);
            
            const image = fs.readFileSync(outputFile);
            
            await sock.sendMessage(context.from, {
                image: image,
                caption: '✅ Sticker converted to image!'
            }, { quoted: msg });
            
            // Cleanup
            fs.unlinkSync(tempFile);
            fs.unlinkSync(outputFile);
            
        } catch (error) {
            console.error('Image conversion error:', error);
            await sock.sendMessage(context.from, {
                text: '❌ Failed to convert sticker to image!'
            }, { quoted: msg });
        }
    }
};
