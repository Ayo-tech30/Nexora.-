import axios from 'axios';

export default {
    name: 'lyrics',
    description: 'Search song lyrics',
    execute: async (sock, msg, args, context) => {
        if (args.length === 0) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please provide a song name!\nUsage: .lyrics <song name>\n\nExample: .lyrics Bohemian Rhapsody'
            }, { quoted: msg });
        }
        
        const songName = args.join(' ');
        
        await sock.sendMessage(context.from, {
            text: '🎵 Searching lyrics...'
        }, { quoted: msg });
        
        try {
            // Using lyrics.ovh API
            const apiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(songName.split(' ')[0])}/${encodeURIComponent(songName)}`;
            
            const response = await axios.get(apiUrl);
            
            if (response.data && response.data.lyrics) {
                const lyrics = response.data.lyrics;
                const truncated = lyrics.length > 4000 ? lyrics.substring(0, 4000) + '...\n\n[Lyrics truncated]' : lyrics;
                
                await sock.sendMessage(context.from, {
                    text: `🎵 **Lyrics for "${songName}"**\n\n${truncated}`
                }, { quoted: msg });
            } else {
                throw new Error('No lyrics found');
            }
        } catch (error) {
            console.error('Lyrics search error:', error);
            
            // Try alternative API
            try {
                const altUrl = `https://some-random-api.ml/lyrics?title=${encodeURIComponent(songName)}`;
                const altResponse = await axios.get(altUrl);
                
                if (altResponse.data && altResponse.data.lyrics) {
                    await sock.sendMessage(context.from, {
                        text: `🎵 **${altResponse.data.title}**\n👤 ${altResponse.data.author}\n\n${altResponse.data.lyrics.substring(0, 4000)}`
                    }, { quoted: msg });
                } else {
                    throw new Error('No lyrics found');
                }
            } catch (altError) {
                await sock.sendMessage(context.from, {
                    text: `❌ Lyrics not found for "${songName}"!\n\nTry:\n- Checking the song name spelling\n- Including artist name\n- Searching on genius.com`
                }, { quoted: msg });
            }
        }
    }
};
