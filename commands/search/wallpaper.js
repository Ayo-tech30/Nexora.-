import axios from 'axios';

export default {
    name: 'wallpaper',
    description: 'Get random wallpaper',
    execute: async (sock, msg, args, context) => {
        const query = args.join(' ') || 'nature';
        
        await sock.sendMessage(context.from, {
            text: '🖼️ Fetching wallpaper...'
        }, { quoted: msg });
        
        try {
            // Using Unsplash API for high-quality wallpapers
            const apiUrl = `https://source.unsplash.com/1920x1080/?${encodeURIComponent(query)}`;
            
            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                maxRedirects: 5
            });
            
            await sock.sendMessage(context.from, {
                image: Buffer.from(response.data),
                caption: `🖼️ **Wallpaper**\n\nTheme: ${query}\n\nUse .wallpaper <theme> for specific wallpapers!`
            }, { quoted: msg });
            
        } catch (error) {
            console.error('Wallpaper fetch error:', error);
            await sock.sendMessage(context.from, {
                text: '❌ Failed to fetch wallpaper!\n\nTry: .wallpaper <theme>\nExamples: nature, space, anime, sunset'
            }, { quoted: msg });
        }
    }
};
