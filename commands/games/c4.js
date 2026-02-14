import { db } from '../../index.js';

const activeGames = new Map();

export default {
    name: 'c4',
    description: 'Play Connect 4',
    groupOnly: true,
    execute: async (sock, msg, args, context) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        const gameKey = `c4_${context.from}`;
        
        if (args[0] === 'accept') {
            const game = activeGames.get(gameKey);
            
            if (!game || game.player2 !== context.sender) {
                return await sock.sendMessage(context.from, {
                    text: '⚠️ No game invitation for you!'
                }, { quoted: msg });
            }
            
            game.status = 'playing';
            game.turn = game.player1;
            
            await sock.sendMessage(context.from, {
                text: `🔴 **Connect 4 Started!**\n\n${renderC4Board(game.board)}\n\n@${game.player1.split('@')[0]} (🔴) vs @${game.player2.split('@')[0]} (🟡)\n\nCurrent turn: @${game.player1.split('@')[0]}\n\nUse: .c4 <column> (1-7)`,
                mentions: [game.player1, game.player2]
            });
            
            return;
        }
        
        if (args[0] >= '1' && args[0] <= '7') {
            const game = activeGames.get(gameKey);
            
            if (!game || game.status !== 'playing') {
                return await sock.sendMessage(context.from, {
                    text: '⚠️ No active game! Start one with .c4 @user'
                }, { quoted: msg });
            }
            
            if (game.turn !== context.sender) {
                return await sock.sendMessage(context.from, {
                    text: '⚠️ Not your turn!'
                }, { quoted: msg });
            }
            
            const column = parseInt(args[0]) - 1;
            
            // Find lowest empty row in column
            let row = -1;
            for (let r = 5; r >= 0; r--) {
                if (game.board[r][column] === '⬜') {
                    row = r;
                    break;
                }
            }
            
            if (row === -1) {
                return await sock.sendMessage(context.from, {
                    text: '⚠️ Column is full!'
                }, { quoted: msg });
            }
            
            game.board[row][column] = game.turn === game.player1 ? '🔴' : '🟡';
            
            // Check win
            const winner = checkC4Winner(game.board);
            
            if (winner) {
                activeGames.delete(gameKey);
                const winnerUser = winner === '🔴' ? game.player1 : game.player2;
                
                return await sock.sendMessage(context.from, {
                    text: `🔴 **Game Over!**\n\n${renderC4Board(game.board)}\n\n🏆 Winner: @${winnerUser.split('@')[0]}!`,
                    mentions: [winnerUser]
                });
            }
            
            // Check draw
            if (game.board[0].every(cell => cell !== '⬜')) {
                activeGames.delete(gameKey);
                return await sock.sendMessage(context.from, {
                    text: `🔴 **Game Over!**\n\n${renderC4Board(game.board)}\n\n🤝 It's a draw!`
                });
            }
            
            game.turn = game.turn === game.player1 ? game.player2 : game.player1;
            
            await sock.sendMessage(context.from, {
                text: `🔴 **Connect 4**\n\n${renderC4Board(game.board)}\n\nCurrent turn: @${game.turn.split('@')[0]}`,
                mentions: [game.turn]
            });
            
            return;
        }
        
        if (!mentioned || mentioned.length === 0) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please mention someone!\nUsage: .c4 @user'
            }, { quoted: msg });
        }
        
        const opponent = mentioned[0];
        
        if (opponent === context.sender) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ You can\'t play with yourself!'
            }, { quoted: msg });
        }
        
        if (activeGames.has(gameKey)) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ A game is already in progress!'
            }, { quoted: msg });
        }
        
        activeGames.set(gameKey, {
            player1: context.sender,
            player2: opponent,
            board: Array(6).fill(null).map(() => Array(7).fill('⬜')),
            status: 'waiting',
            turn: null
        });
        
        await sock.sendMessage(context.from, {
            text: `🔴 **Connect 4 Invitation!**\n\n@${context.sender.split('@')[0]} challenged @${opponent.split('@')[0]}!\n\n@${opponent.split('@')[0]}, type .c4 accept to start!`,
            mentions: [context.sender, opponent]
        });
    }
};

function renderC4Board(board) {
    let result = '\n1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n';
    for (let row of board) {
        result += row.join('') + '\n';
    }
    return result;
}

function checkC4Winner(board) {
    // Check horizontal
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] !== '⬜' && 
                board[r][c] === board[r][c+1] && 
                board[r][c] === board[r][c+2] && 
                board[r][c] === board[r][c+3]) {
                return board[r][c];
            }
        }
    }
    
    // Check vertical
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 7; c++) {
            if (board[r][c] !== '⬜' && 
                board[r][c] === board[r+1][c] && 
                board[r][c] === board[r+2][c] && 
                board[r][c] === board[r+3][c]) {
                return board[r][c];
            }
        }
    }
    
    // Check diagonal (down-right)
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] !== '⬜' && 
                board[r][c] === board[r+1][c+1] && 
                board[r][c] === board[r+2][c+2] && 
                board[r][c] === board[r+3][c+3]) {
                return board[r][c];
            }
        }
    }
    
    // Check diagonal (down-left)
    for (let r = 0; r < 3; r++) {
        for (let c = 3; c < 7; c++) {
            if (board[r][c] !== '⬜' && 
                board[r][c] === board[r+1][c-1] && 
                board[r][c] === board[r+2][c-2] && 
                board[r][c] === board[r+3][c-3]) {
                return board[r][c];
            }
        }
    }
    
    return null;
}
