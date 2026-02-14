import axios from 'axios';

export default {
    name: 'waifu',
    description: 'Get random waifu image',
    execute: async (sock, msg, args, context) => {
        try {
            // Using waifu.pics API
            const response = await axios.get('https://api.waifu.pics/sfw/waifu');
            
            if (response.data && response.data.url) {
                const imageResponse = await axios.get(response.data.url, {
                    responseType: 'arraybuffer'
                });
                
                await sock.sendMessage(context.from, {
                    image: Buffer.from(imageResponse.data),
                    caption: '🌸 Here\'s your waifu! 💕'
                }, { quoted: msg });
            } else {
                throw new Error('No image URL');
            }
        } catch (error) {
            console.error('Waifu error:', error);
            await sock.sendMessage(context.from, {
                text: '❌ Failed to fetch waifu image!'
            }, { quoted: msg });
        }
    }
};
