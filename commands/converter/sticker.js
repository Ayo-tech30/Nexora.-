import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export default {
    name: 'sticker',
    aliases: ['s'],
    description: 'Convert image/video to sticker',
    execute: async (sock, msg, args, context) => {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const messageType = Object.keys(msg.message)[0];
        
        let media = null;
        
        // Check if replying to media
        if (quoted) {
            if (quoted.imageMessage) {
                media = await downloadMediaMessage(
                    { message: { imageMessage: quoted.imageMessage } },
                    'buffer',
                    {}
                );
            } else if (quoted.videoMessage) {
                media = await downloadMediaMessage(
                    { message: { videoMessage: quoted.videoMessage } },
                    'buffer',
                    {}
                );
            }
        } else if (messageType === 'imageMessage') {
            media = await downloadMediaMessage(msg, 'buffer', {});
        } else if (messageType === 'videoMessage') {
            media = await downloadMediaMessage(msg, 'buffer', {});
        }
        
        if (!media) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please send or reply to an image/video!\nUsage: .sticker (with image/video)'
            }, { quoted: msg });
        }
        
        const tempFile = path.join('/tmp', `sticker_${Date.now()}`);
        const outputFile = `${tempFile}.webp`;
        
        try {
            // Save media to temp file
            fs.writeFileSync(tempFile, media);
            
            // Convert to webp sticker format
            await execPromise(
                `ffmpeg -i ${tempFile} -vf "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,fps=15" -vcodec libwebp -lossless 0 -compression_level 6 -q:v 50 -loop 0 -preset default -an -vsync 0 -s 512:512 ${outputFile}`
            );
            
            const sticker = fs.readFileSync(outputFile);
            
            await sock.sendMessage(context.from, {
                sticker: sticker
            }, { quoted: msg });
            
            // Cleanup
            fs.unlinkSync(tempFile);
            fs.unlinkSync(outputFile);
            
        } catch (error) {
            console.error('Sticker creation error:', error);
            await sock.sendMessage(context.from, {
                text: '❌ Failed to create sticker! Make sure the file is a valid image/video.'
            }, { quoted: msg });
            
            // Cleanup on error
            try {
                if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
            } catch {}
        }
    }
};
