import { db } from '../../index.js';

export default {
    name: 'nsfw',
    description: 'Toggle NSFW mode',
    adminOnly: true,
    groupOnly: true,
    execute: async (sock, msg, args, context) => {
        const action = args[0]?.toLowerCase();
        
        if (action !== 'on' && action !== 'off') {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please specify on or off!\nUsage: .nsfw on/off'
            }, { quoted: msg });
        }
        
        const enabled = action === 'on';
        await db.ref(`groups/${context.from}/settings/nsfwEnabled`).set(enabled);
        
        await sock.sendMessage(context.from, {
            text: `🔞 NSFW mode ${enabled ? 'enabled' : 'disabled'}!\n\n${enabled ? '⚠️ NSFW commands are now available in this group.' : '✅ NSFW commands are now disabled.'}`
        }, { quoted: msg });
    }
};
