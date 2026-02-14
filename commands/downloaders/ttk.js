import axios from 'axios';

export default {
    name: 'ttk',
    description: 'Download TikTok video',
    execute: async (sock, msg, args, context) => {
        if (!args[0]) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please provide a TikTok URL!\nUsage: .ttk <tiktok_url>'
            }, { quoted: msg });
        }
        
        const url = args[0];
        
        if (!url.includes('tiktok.com') && !url.includes('vt.tiktok.com')) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please provide a valid TikTok URL!'
            }, { quoted: msg });
        }
        
        await sock.sendMessage(context.from, {
            text: '⏳ Downloading TikTok video... Please wait...'
        }, { quoted: msg });
        
        try {
            // TikTok downloader API endpoint
            const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
            
            const response = await axios.get(apiUrl);
            
            if (response.data && response.data.video && response.data.video.noWatermark) {
                const videoUrl = response.data.video.noWatermark;
                const title = response.data.title || 'TikTok Video';
                const author = response.data.author?.nickname || 'Unknown';
                
                const videoResponse = await axios.get(videoUrl, {
                    responseType: 'arraybuffer',
                    maxContentLength: 50 * 1024 * 1024
                });
                
                await sock.sendMessage(context.from, {
                    video: Buffer.from(videoResponse.data),
                    caption: `✅ **TikTok Download**\n\n👤 Author: ${author}\n📝 ${title}`,
                    mimetype: 'video/mp4'
                }, { quoted: msg });
            } else {
                throw new Error('No video URL found');
            }
        } catch (error) {
            console.error('TikTok download error:', error);
            await sock.sendMessage(context.from, {
                text: `❌ Failed to download TikTok video!

Try these alternatives:
- snaptik.app
- tikmate.app
- musicallydown.com`
            }, { quoted: msg });
        }
    }
};
