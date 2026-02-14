// Card database with anime characters
export const cardDatabase = {
    naruto: {
        name: 'Naruto',
        series: 'Naruto',
        tiers: {
            common: { rarity: 'Common', value: 1000 },
            rare: { rarity: 'Rare', value: 5000 },
            epic: { rarity: 'Epic', value: 15000 },
            legendary: { rarity: 'Legendary', value: 50000 }
        }
    },
    sasuke: {
        name: 'Sasuke',
        series: 'Naruto',
        tiers: {
            common: { rarity: 'Common', value: 1000 },
            rare: { rarity: 'Rare', value: 5000 },
            epic: { rarity: 'Epic', value: 15000 },
            legendary: { rarity: 'Legendary', value: 50000 }
        }
    },
    luffy: {
        name: 'Luffy',
        series: 'One Piece',
        tiers: {
            common: { rarity: 'Common', value: 1200 },
            rare: { rarity: 'Rare', value: 5500 },
            epic: { rarity: 'Epic', value: 16000 },
            legendary: { rarity: 'Legendary', value: 55000 }
        }
    },
    zoro: {
        name: 'Zoro',
        series: 'One Piece',
        tiers: {
            common: { rarity: 'Common', value: 1200 },
            rare: { rarity: 'Rare', value: 5500 },
            epic: { rarity: 'Epic', value: 16000 },
            legendary: { rarity: 'Legendary', value: 55000 }
        }
    },
    goku: {
        name: 'Goku',
        series: 'Dragon Ball',
        tiers: {
            common: { rarity: 'Common', value: 1500 },
            rare: { rarity: 'Rare', value: 6000 },
            epic: { rarity: 'Epic', value: 18000 },
            legendary: { rarity: 'Legendary', value: 60000 }
        }
    },
    vegeta: {
        name: 'Vegeta',
        series: 'Dragon Ball',
        tiers: {
            common: { rarity: 'Common', value: 1500 },
            rare: { rarity: 'Rare', value: 6000 },
            epic: { rarity: 'Epic', value: 18000 },
            legendary: { rarity: 'Legendary', value: 60000 }
        }
    },
    eren: {
        name: 'Eren Yeager',
        series: 'Attack on Titan',
        tiers: {
            common: { rarity: 'Common', value: 1300 },
            rare: { rarity: 'Rare', value: 5800 },
            epic: { rarity: 'Epic', value: 17000 },
            legendary: { rarity: 'Legendary', value: 58000 }
        }
    },
    mikasa: {
        name: 'Mikasa',
        series: 'Attack on Titan',
        tiers: {
            common: { rarity: 'Common', value: 1300 },
            rare: { rarity: 'Rare', value: 5800 },
            epic: { rarity: 'Epic', value: 17000 },
            legendary: { rarity: 'Legendary', value: 58000 }
        }
    },
    saitama: {
        name: 'Saitama',
        series: 'One Punch Man',
        tiers: {
            common: { rarity: 'Common', value: 1100 },
            rare: { rarity: 'Rare', value: 5200 },
            epic: { rarity: 'Epic', value: 15500 },
            legendary: { rarity: 'Legendary', value: 52000 }
        }
    },
    genos: {
        name: 'Genos',
        series: 'One Punch Man',
        tiers: {
            common: { rarity: 'Common', value: 1100 },
            rare: { rarity: 'Rare', value: 5200 },
            epic: { rarity: 'Epic', value: 15500 },
            legendary: { rarity: 'Legendary', value: 52000 }
        }
    }
};

export function generateRandomCard() {
    const cards = Object.keys(cardDatabase);
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    const cardData = cardDatabase[randomCard];
    
    // Rarity chances: Common 60%, Rare 25%, Epic 12%, Legendary 3%
    const rand = Math.random() * 100;
    let tier;
    
    if (rand < 60) tier = 'common';
    else if (rand < 85) tier = 'rare';
    else if (rand < 97) tier = 'epic';
    else tier = 'legendary';
    
    return {
        id: `${randomCard}_${tier}_${Date.now()}`,
        character: randomCard,
        name: cardData.name,
        series: cardData.series,
        tier: tier,
        rarity: cardData.tiers[tier].rarity,
        value: cardData.tiers[tier].value
    };
}

export function getCardInfo(character, tier) {
    const cardData = cardDatabase[character.toLowerCase()];
    if (!cardData) return null;
    
    const tierData = cardData.tiers[tier.toLowerCase()];
    if (!tierData) return null;
    
    return {
        character: character,
        name: cardData.name,
        series: cardData.series,
        tier: tier,
        rarity: tierData.rarity,
        value: tierData.value
    };
}
