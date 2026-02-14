import { formatNumber } from '../../utils/formatter.js';

export default {
    name: 'deck',
    aliases: ['col'],
    description: 'View your card collection',
    execute: async (sock, msg, args, context) => {
        const cards = context.userData.cards || [];
        
        if (cards.length === 0) {
            return await sock.sendMessage(context.from, {
                text: '📦 Your card collection is empty!\n\nWait for cards to spawn in groups and claim them with .claim'
            }, { quoted: msg });
        }
        
        // Count cards by rarity
        const rarityCounts = {
            common: 0,
            rare: 0,
            epic: 0,
            legendary: 0
        };
        
        let totalValue = 0;
        
        cards.forEach(card => {
            rarityCounts[card.tier]++;
            totalValue += card.value;
        });
        
        // Group by series
        const seriesCards = {};
        cards.forEach(card => {
            if (!seriesCards[card.series]) {
                seriesCards[card.series] = [];
            }
            seriesCards[card.series].push(card);
        });
        
        let text = `🎴 **${context.userData.name || context.pushname}'s Collection**

📊 **Statistics:**
⬜ Common: ${rarityCounts.common}
🟦 Rare: ${rarityCounts.rare}
🟪 Epic: ${rarityCounts.epic}
🟨 Legendary: ${rarityCounts.legendary}

💎 Total Value: ${formatNumber(totalValue)} coins
📚 Total Cards: ${cards.length}

**Collections by Series:**\n`;

        Object.entries(seriesCards).forEach(([series, seriesCardList]) => {
            text += `\n📖 ${series} (${seriesCardList.length})\n`;
            seriesCardList.slice(0, 5).forEach((card, i) => {
                const emoji = { common: '⬜', rare: '🟦', epic: '🟪', legendary: '🟨' };
                text += `${emoji[card.tier]} ${card.name} [${i + 1}]\n`;
            });
            if (seriesCardList.length > 5) {
                text += `... and ${seriesCardList.length - 5} more\n`;
            }
        });
        
        text += `\nUse .card <index> to view details`;
        
        await sock.sendMessage(context.from, { text }, { quoted: msg });
    }
};
