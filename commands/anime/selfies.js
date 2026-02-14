import axios from 'axios';
import { db } from '../../index.js';

export default {
    name: 'selfies',
    description: 'Get selfies image',
    groupOnly: true,
    execute: async (sock, msg, args, context) => {
        // Check if NSFW is enabled (for NSFW commands)
        const isNSFW = ['hentai', 'ecchi'].includes('selfies');
        
        if (context.isGroup && isNSFW) {
            const settings = (await db.ref(`groups/${context.from}/settings`).once('value')).val();
            if (!settings || !settings.nsfwEnabled) {
                return await sock.sendMessage(context.from, {
                    text: '⚠️ NSFW is disabled in this group!\nAdmin can enable with: .nsfw on'
                }, { quoted: msg });
            }
        }
        
        try {
            const endpoint = isNSFW ? 'nsfw' : 'sfw';
            const response = await axios.get(`https://api.waifu.pics/${endpoint}/selfies`);
            
            if (response.data && response.data.url) {
                const imageResponse = await axios.get(response.data.url, {
                    responseType: 'arraybuffer'
                });
                
                await sock.sendMessage(context.from, {
                    image: Buffer.from(imageResponse.data),
                    caption: isNSFW ? '🔞 NSFW Content' : '✨ Enjoy!'
                }, { quoted: msg });
            } else {
                throw new Error('No image URL');
            }
        } catch (error) {
            console.error('selfies error:', error);
            await sock.sendMessage(context.from, {
                text: '❌ Failed to fetch image!'
            }, { quoted: msg });
        }
    }
};
