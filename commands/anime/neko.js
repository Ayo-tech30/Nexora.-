import axios from 'axios';

export default {
    name: 'neko',
    description: 'Get random neko image',
    execute: async (sock, msg, args, context) => {
        try {
            const response = await axios.get('https://api.waifu.pics/sfw/neko');
            
            if (response.data && response.data.url) {
                const imageResponse = await axios.get(response.data.url, {
                    responseType: 'arraybuffer'
                });
                
                await sock.sendMessage(context.from, {
                    image: Buffer.from(imageResponse.data),
                    caption: '🐱 Nya~ Here\'s a cute neko! 💕'
                }, { quoted: msg });
            } else {
                throw new Error('No image URL');
            }
        } catch (error) {
            console.error('Neko error:', error);
            await sock.sendMessage(context.from, {
                text: '❌ Failed to fetch neko image!'
            }, { quoted: msg });
        }
    }
};
