import { db } from '../../index.js';

export default {
    name: 'claim',
    description: 'Claim a spawned card',
    groupOnly: true,
    execute: async (sock, msg, args, context) => {
        try {
            const spawnData = (await db.ref(`cardSpawns/${context.from}`).once('value')).val();
            
            if (!spawnData || !spawnData.card) {
                return await sock.sendMessage(context.from, {
                    text: '⚠️ No card available to claim!\nWait for a card to spawn.'
                }, { quoted: msg });
            }
            
            // Check if claim is within 2 minutes of spawn
            if (Date.now() - spawnData.timestamp > 120000) {
                await db.ref(`cardSpawns/${context.from}`).remove();
                return await sock.sendMessage(context.from, {
                    text: '❌ Card claim expired! Be faster next time.'
                }, { quoted: msg });
            }
            
            const card = spawnData.card;
            
            // Add card to user's collection
            const userCards = context.userData.cards || [];
            userCards.push(card);
            
            await db.ref(`users/${context.userId}/cards`).set(userCards);
            await db.ref(`cardSpawns/${context.from}`).remove();
            
            const rarityEmoji = {
                common: '⬜',
                rare: '🟦',
                epic: '🟪',
                legendary: '🟨'
            };
            
            await sock.sendMessage(context.from, {
                text: `✅ ${context.pushname} claimed the card!

${rarityEmoji[card.tier]} **${card.name}**
📚 ${card.series}
⭐ ${card.rarity}
💎 ${card.value} coins

Total cards: ${userCards.length}`
            }, { quoted: msg });
            
        } catch (error) {
            console.error('Claim error:', error);
            await sock.sendMessage(context.from, {
                text: '❌ Failed to claim card!'
            }, { quoted: msg });
        }
    }
};
