import axios from 'axios';

export const interactions = {
    hug: { text: '{user1} hugs {user2}! 🤗', endpoint: 'hug' },
    kiss: { text: '{user1} kisses {user2}! 😘', endpoint: 'kiss' },
    slap: { text: '{user1} slaps {user2}! 👋', endpoint: 'slap' },
    wave: { text: '{user1} waves at {user2}! 👋', endpoint: 'wave' },
    pat: { text: '{user1} pats {user2}! 🫳', endpoint: 'pat' },
    dance: { text: '{user1} dances with {user2}! 💃', endpoint: 'dance' },
    sad: { text: '{user1} is sad... 😢', endpoint: 'cry' },
    smile: { text: '{user1} smiles at {user2}! 😊', endpoint: 'smile' },
    laugh: { text: '{user1} laughs! 😂', endpoint: 'laugh' },
    lick: { text: '{user1} licks {user2}! 👅', endpoint: 'lick' },
    punch: { text: '{user1} punches {user2}! 👊', endpoint: 'punch' },
    kill: { text: '{user1} kills {user2}! ☠️', endpoint: 'kill' },
    bonk: { text: '{user1} bonks {user2}! 🔨', endpoint: 'bonk' },
    tickle: { text: '{user1} tickles {user2}! 😆', endpoint: 'tickle' },
    shrug: { text: '{user1} shrugs ¯\\_(ツ)_/¯', endpoint: 'shrug' },
    kidnap: { text: '{user1} kidnaps {user2}! 🚐', endpoint: 'pat' },  // fallback to pat
    fuck: { text: '{user1} fucks {user2}! 🔞', endpoint: 'kiss' },  // fallback to kiss
    wank: { text: '{user1} wanks! 🔞', endpoint: 'wink' },  // fallback
    jihad: { text: '{user1} declares jihad! 💣', endpoint: 'punch' },
    crusade: { text: '{user1} starts a crusade! ⚔️', endpoint: 'punch' }
};

export function createInteractionCommand(name) {
    return {
        name,
        description: `${name} someone`,
        execute: async (sock, msg, args, context) => {
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const user1 = context.pushname;
            const user2 = mentioned && mentioned[0] ? `@${mentioned[0].split('@')[0]}` : 'someone';
            
            const interaction = interactions[name];
            const text = interaction.text
                .replace('{user1}', user1)
                .replace('{user2}', user2);

            try {
                // Get anime GIF from waifu.pics API
                const response = await axios.get(`https://api.waifu.pics/sfw/${interaction.endpoint}`);
                
                if (response.data && response.data.url) {
                    // Download the GIF
                    const gifResponse = await axios.get(response.data.url, {
                        responseType: 'arraybuffer'
                    });
                    
                    // Send as GIF/video
                    await sock.sendMessage(context.from, {
                        video: Buffer.from(gifResponse.data),
                        caption: text,
                        gifPlayback: true,
                        mentions: mentioned || []
                    }, { quoted: msg });
                } else {
                    // Fallback to text only if API fails
                    await sock.sendMessage(context.from, { 
                        text,
                        mentions: mentioned || []
                    }, { quoted: msg });
                }
            } catch (error) {
                console.error(`Error fetching ${name} GIF:`, error.message);
                // Fallback to text only
                await sock.sendMessage(context.from, { 
                    text,
                    mentions: mentioned || []
                }, { quoted: msg });
            }
        }
    };
}

