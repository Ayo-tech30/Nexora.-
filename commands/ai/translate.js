import axios from 'axios';

export default {
    name: 'translate',
    aliases: ['tt'],
    description: 'Translate text to any language',
    execute: async (sock, msg, args, context) => {
        if (args.length < 2) {
            return await sock.sendMessage(context.from, {
                text: `⚠️ Please provide language and text!

Usage: .translate <language> <text>

Examples:
.translate spanish Hello, how are you?
.translate french Good morning
.translate japanese I love anime

Common languages: english, spanish, french, german, italian, japanese, korean, chinese, arabic, hindi`
            }, { quoted: msg });
        }
        
        const targetLang = args[0].toLowerCase();
        const text = args.slice(1).join(' ');
        
        await sock.sendMessage(context.from, {
            text: '🌐 Translating...'
        }, { quoted: msg });
        
        try {
            // Using LibreTranslate API (free and open source)
            const langCodes = {
                'english': 'en', 'spanish': 'es', 'french': 'fr', 'german': 'de',
                'italian': 'it', 'japanese': 'ja', 'korean': 'ko', 'chinese': 'zh',
                'arabic': 'ar', 'hindi': 'hi', 'portuguese': 'pt', 'russian': 'ru'
            };
            
            const targetCode = langCodes[targetLang] || targetLang;
            
            const response = await axios.post('https://libretranslate.de/translate', {
                q: text,
                source: 'auto',
                target: targetCode,
                format: 'text'
            });
            
            if (response.data && response.data.translatedText) {
                await sock.sendMessage(context.from, {
                    text: `🌐 **Translation**\n\n📝 Original: ${text}\n\n✅ Translated (${targetLang}): ${response.data.translatedText}`
                }, { quoted: msg });
            } else {
                throw new Error('No translation received');
            }
        } catch (error) {
            console.error('Translation error:', error);
            await sock.sendMessage(context.from, {
                text: `❌ Failed to translate!

Possible reasons:
- Invalid language code
- Text too long
- API error

Try: Google Translate manually for now`
            }, { quoted: msg });
        }
    }
};
