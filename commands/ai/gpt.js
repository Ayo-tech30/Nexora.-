import axios from 'axios';

export default {
    name: 'gpt',
    description: 'Chat with GPT AI',
    execute: async (sock, msg, args, context) => {
        if (args.length === 0) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please provide a question!\nUsage: .gpt <your question>'
            }, { quoted: msg });
        }
        
        const question = args.join(' ');
        
        await sock.sendMessage(context.from, {
            text: '🤖 Thinking...'
        }, { quoted: msg });
        
        try {
            // Using free GPT API (you can replace with OpenAI API)
            const response = await axios.post('https://api.deepinfra.com/v1/openai/chat/completions', {
                model: 'meta-llama/Meta-Llama-3-8B-Instruct',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant in a WhatsApp bot called Nexora.' },
                    { role: 'user', content: question }
                ],
                max_tokens: 500
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            
            if (response.data && response.data.choices && response.data.choices[0]) {
                const answer = response.data.choices[0].message.content;
                
                await sock.sendMessage(context.from, {
                    text: `🤖 **GPT Response:**\n\n${answer}`
                }, { quoted: msg });
            } else {
                throw new Error('No response from API');
            }
        } catch (error) {
            console.error('GPT error:', error);
            
            // Fallback to simple responses
            const fallbackResponses = {
                'hello': 'Hello! How can I help you today?',
                'hi': 'Hi there! What would you like to know?',
                'how are you': 'I\'m doing great! Thanks for asking. How about you?',
                'who are you': 'I\'m Nexora, a WhatsApp bot created by KYNX!',
                'help': 'I can help you with various tasks! Use .menu to see all commands.'
            };
            
            const lowerQuestion = question.toLowerCase();
            const fallback = Object.keys(fallbackResponses).find(key => lowerQuestion.includes(key));
            
            if (fallback) {
                await sock.sendMessage(context.from, {
                    text: `🤖 ${fallbackResponses[fallback]}`
                }, { quoted: msg });
            } else {
                await sock.sendMessage(context.from, {
                    text: `❌ Failed to get AI response!

To enable full AI functionality:
1. Get OpenAI API key from openai.com
2. Or use other AI APIs (Anthropic, Cohere, etc.)
3. Add your API key to the bot

Question asked: "${question}"`
                }, { quoted: msg });
            }
        }
    }
};
