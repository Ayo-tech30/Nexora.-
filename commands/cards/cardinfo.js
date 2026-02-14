import { getCardInfo } from '../../utils/cardSystem.js';
import { formatNumber } from '../../utils/formatter.js';

export default {
    name: 'cardinfo',
    aliases: ['ci'],
    description: 'Get card information',
    execute: async (sock, msg, args, context) => {
        if (args.length < 2) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please provide character name and tier!\nUsage: .cardinfo <character> <tier>\n\nExample: .cardinfo naruto legendary\n\nTiers: common, rare, epic, legendary'
            }, { quoted: msg });
        }
        
        const character = args[0].toLowerCase();
        const tier = args[1].toLowerCase();
        
        const card = getCardInfo(character, tier);
        
        if (!card) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Card not found!\n\nCheck character name and tier.\nUse .clb to see available cards.'
            }, { quoted: msg });
        }
        
        const rarityEmoji = {
            common: '⬜',
            rare: '🟦',
            epic: '🟪',
            legendary: '🟨'
        };
        
        const text = `🎴 **Card Information**

${rarityEmoji[tier]} **${card.name}**
📚 Series: ${card.series}
⭐ Rarity: ${card.rarity}
💎 Value: ${formatNumber(card.value)} coins

Tier: ${tier.toUpperCase()}`;
        
        await sock.sendMessage(context.from, { text }, { quoted: msg });
    }
};
