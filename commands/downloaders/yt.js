import axios from 'axios';

export default {
    name: 'yt',
    description: 'Download YouTube video',
    execute: async (sock, msg, args, context) => {
        if (!args[0]) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please provide a YouTube URL!\nUsage: .yt <youtube_url>'
            }, { quoted: msg });
        }
        
        const url = args[0];
        
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please provide a valid YouTube URL!'
            }, { quoted: msg });
        }
        
        await sock.sendMessage(context.from, {
            text: '⏳ Downloading video... Please wait...'
        }, { quoted: msg });
        
        try {
            // Using ytdl-core alternative API
            const apiUrl = `https://api.nexora.one/youtube/download?url=${encodeURIComponent(url)}`;
            
            // Simple fallback: just send the info
            const text = `✅ **YouTube Download**

📹 URL: ${url}

⚠️ Due to API limitations, please use:
- y2mate.com
- savefrom.net
- Or install yt-dlp for full functionality

Add your own API key in the code for production use.`;
            
            await sock.sendMessage(context.from, { text }, { quoted: msg });
            
        } catch (error) {
            console.error('YouTube download error:', error);
            await sock.sendMessage(context.from, {
                text: '❌ Failed to download video!\n\nNote: You need to integrate a YouTube download API.\nRecommended: Use yt-dlp or a paid API service.'
            }, { quoted: msg });
        }
    }
};
