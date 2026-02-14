export default {
    name: 'testowner',
    description: 'Test if owner detection is working',
    execute: async (sock, msg, args, context) => {
        const ownerNumber = '2349049460676';
        
        const checks = {
            userId: context.userId,
            sender: context.sender,
            isOwner: context.isOwner,
            userIdMatch: context.userId === ownerNumber,
            senderMatch: context.sender === `${ownerNumber}@s.whatsapp.net`,
            includesMatch: context.sender.includes(ownerNumber)
        };
        
        const text = `🔍 **Owner Check Debug**

📱 Your User ID: ${checks.userId}
📞 Your Sender: ${checks.sender}
👑 Is Owner (from context): ${checks.isOwner ? '✅ YES' : '❌ NO'}

**Detailed Checks:**
- User ID Match: ${checks.userIdMatch ? '✅' : '❌'}
- Sender Match: ${checks.senderMatch ? '✅' : '❌'}
- Includes Match: ${checks.includesMatch ? '✅' : '❌'}

**Expected Owner:** ${ownerNumber}

${checks.isOwner ? '✅ You ARE recognized as owner!' : '❌ You are NOT recognized as owner!'}`;

        await sock.sendMessage(context.from, { text }, { quoted: msg });
    }
};
