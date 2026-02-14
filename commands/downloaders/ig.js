import axios from 'axios';

export default {
    name: 'ig',
    description: 'Download Instagram media',
    execute: async (sock, msg, args, context) => {
        if (!args[0]) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please provide an Instagram URL!\nUsage: .ig <instagram_url>'
            }, { quoted: msg });
        }
        
        const url = args[0];
        
        if (!url.includes('instagram.com')) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please provide a valid Instagram URL!'
            }, { quoted: msg });
        }
        
        await sock.sendMessage(context.from, {
            text: '⏳ Downloading from Instagram... Please wait...'
        }, { quoted: msg });
        
        try {
            // Use InstaDownloader API
            const apiUrl = `https://api.instagramdownloader.com/download?url=${encodeURIComponent(url)}`;
            
            const response = await axios.get(apiUrl);
            
            if (response.data && response.data.download_url) {
                const mediaUrl = response.data.download_url;
                const isVideo = response.data.type === 'video';
                
                const mediaResponse = await axios.get(mediaUrl, {
                    responseType: 'arraybuffer',
                    maxContentLength: 50 * 1024 * 1024
                });
                
                if (isVideo) {
                    await sock.sendMessage(context.from, {
                        video: Buffer.from(mediaResponse.data),
                        caption: '✅ Downloaded from Instagram'
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(context.from, {
                        image: Buffer.from(mediaResponse.data),
                        caption: '✅ Downloaded from Instagram'
                    }, { quoted: msg });
                }
            } else {
                throw new Error('No download URL found');
            }
        } catch (error) {
            console.error('Instagram download error:', error);
            await sock.sendMessage(context.from, {
                text: `❌ Failed to download from Instagram!

Note: To make this work properly, you need to:
1. Get API key from rapidapi.com
2. Use Instagram Downloader API
3. Add your API key to the bot

For now, try these alternatives:
- instadownloader.com
- igram.io`
            }, { quoted: msg });
        }
    }
};
