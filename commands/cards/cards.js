import { db } from '../../index.js';
import { generateRandomCard } from '../../utils/cardSystem.js';

// Track active card spawns per group
const activeSpawns = new Map();

export default {
    name: 'cards',
    description: 'Toggle card spawning in group',
    adminOnly: true,
    groupOnly: true,
    execute: async (sock, msg, args, context) => {
        const action = args[0]?.toLowerCase();
        
        if (action !== 'on' && action !== 'off') {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please specify on or off!\nUsage: .cards on/off'
            }, { quoted: msg });
        }
        
        const enabled = action === 'on';
        await db.ref(`groups/${context.from}/settings/cardsEnabled`).set(enabled);
        
        if (enabled) {
            // Start spawning cards
            if (!activeSpawns.has(context.from)) {
                startCardSpawning(sock, context.from);
            }
            
            await sock.sendMessage(context.from, {
                text: '🎴 Card spawning enabled!\n\nCards will spawn randomly. Use .claim <id> to claim them!'
            }, { quoted: msg });
        } else {
            // Stop spawning
            if (activeSpawns.has(context.from)) {
                clearInterval(activeSpawns.get(context.from));
                activeSpawns.delete(context.from);
            }
            
            await sock.sendMessage(context.from, {
                text: '🎴 Card spawning disabled!'
            }, { quoted: msg });
        }
    }
};

function startCardSpawning(sock, groupId) {
    // Spawn a card every 5-15 minutes
    const interval = setInterval(async () => {
        try {
            const settings = (await db.ref(`groups/${groupId}/settings`).once('value')).val();
            
            if (!settings || !settings.cardsEnabled) {
                clearInterval(interval);
                activeSpawns.delete(groupId);
                return;
            }
            
            const card = generateRandomCard();
            
            // Store spawn temporarily
            await db.ref(`cardSpawns/${groupId}`).set({
                card: card,
                timestamp: Date.now()
            });
            
            const rarityEmoji = {
                common: '⬜',
                rare: '🟦',
                epic: '🟪',
                legendary: '🟨'
            };
            
            const text = `🎴 A wild card appeared!

${rarityEmoji[card.tier]} **${card.name}**
📚 Series: ${card.series}
⭐ Rarity: ${card.rarity}
💎 Value: ${card.value} coins

Use .claim to catch it!`;
            
            await sock.sendMessage(groupId, { text });
            
        } catch (error) {
            console.error('Card spawn error:', error);
        }
    }, Math.floor(Math.random() * 600000) + 300000); // 5-15 minutes
    
    activeSpawns.set(groupId, interval);
}
