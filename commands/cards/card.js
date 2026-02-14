import { formatNumber } from '../../utils/formatter.js';

export default {
    name: 'card',
    description: 'View a specific card from your collection',
    execute: async (sock, msg, args, context) => {
        const index = parseInt(args[0]);
        
        if (!index || index < 1) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please provide a valid card index!\nUsage: .card <index>\n\nUse .deck to see your cards with their indices.'
            }, { quoted: msg });
        }
        
        const cards = context.userData.cards || [];
        
        if (cards.length === 0) {
            return await sock.sendMessage(context.from, {
                text: '📦 You don\'t have any cards yet!'
            }, { quoted: msg });
        }
        
        if (index > cards.length) {
            return await sock.sendMessage(context.from, {
                text: `⚠️ Invalid index! You only have ${cards.length} cards.`
            }, { quoted: msg });
        }
        
        const card = cards[index - 1];
        
        const rarityEmoji = {
            common: '⬜',
            rare: '🟦',
            epic: '🟪',
            legendary: '🟨'
        };
        
        const text = `🎴 **Card #${index}**

${rarityEmoji[card.tier]} **${card.name}**
📚 Series: ${card.series}
⭐ Rarity: ${card.rarity}
💎 Value: ${formatNumber(card.value)} coins
🆔 ID: ${card.id}

Use .sellc ${index} <price> to sell this card!`;
        
        await sock.sendMessage(context.from, { text }, { quoted: msg });
    }
};
