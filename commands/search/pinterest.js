import axios from 'axios';

export default {
    name: 'pinterest',
    aliases: ['pint'],
    description: 'Search Pinterest images',
    execute: async (sock, msg, args, context) => {
        if (args.length === 0) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please provide a search query!\nUsage: .pinterest <search term>\n\nExample: .pinterest sunset'
            }, { quoted: msg });
        }
        
        const query = args.join(' ');
        
        await sock.sendMessage(context.from, {
            text: '🔍 Searching Pinterest...'
        }, { quoted: msg });
        
        try {
            // Pinterest scraper API
            const apiUrl = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=/search/pins/?q=${encodeURIComponent(query)}&data={"options":{"query":"${query}"},"context":{}}`;
            
            const response = await axios.get(apiUrl);
            
            if (response.data && response.data.resource_response && response.data.resource_response.data) {
                const results = response.data.resource_response.data.results;
                
                if (results && results.length > 0) {
                    // Get random image
                    const randomImage = results[Math.floor(Math.random() * Math.min(10, results.length))];
                    const imageUrl = randomImage.images?.orig?.url || randomImage.images?.['736x']?.url;
                    
                    if (imageUrl) {
                        const imageResponse = await axios.get(imageUrl, {
                            responseType: 'arraybuffer'
                        });
                        
                        await sock.sendMessage(context.from, {
                            image: Buffer.from(imageResponse.data),
                            caption: `📌 **Pinterest Search**\n\nQuery: ${query}\n\nUse .pinterest ${query} again for more results!`
                        }, { quoted: msg });
                    } else {
                        throw new Error('No image URL found');
                    }
                } else {
                    throw new Error('No results found');
                }
            } else {
                throw new Error('API error');
            }
        } catch (error) {
            console.error('Pinterest search error:', error);
            await sock.sendMessage(context.from, {
                text: `❌ Failed to search Pinterest!

Try searching manually at: pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
            }, { quoted: msg });
        }
    }
};
