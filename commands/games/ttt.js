import { db } from '../../index.js';

const activeGames = new Map();

export default {
    name: 'ttt',
    description: 'Play Tic Tac Toe',
    groupOnly: true,
    execute: async (sock, msg, args, context) => {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        
        if (args[0] === 'accept') {
            // Accept game invitation
            const gameKey = `${context.from}`;
            const game = activeGames.get(gameKey);
            
            if (!game) {
                return await sock.sendMessage(context.from, {
                    text: '⚠️ No pending game invitation!'
                }, { quoted: msg });
            }
            
            if (game.player2 !== context.sender) {
                return await sock.sendMessage(context.from, {
                    text: '⚠️ This game invitation is not for you!'
                }, { quoted: msg });
            }
            
            game.status = 'playing';
            game.turn = game.player1;
            
            await sock.sendMessage(context.from, {
                text: `🎮 **Tic Tac Toe Started!**\n\n${renderBoard(game.board)}\n\n@${game.player1.split('@')[0]} (❌) vs @${game.player2.split('@')[0]} (⭕)\n\nCurrent turn: @${game.player1.split('@')[0]}\n\nUse: .ttt <position> (1-9)`,
                mentions: [game.player1, game.player2]
            });
            
            return;
        }
        
        if (args[0] >= '1' && args[0] <= '9') {
            // Make a move
            const gameKey = `${context.from}`;
            const game = activeGames.get(gameKey);
            
            if (!game || game.status !== 'playing') {
                return await sock.sendMessage(context.from, {
                    text: '⚠️ No active game! Start one with .ttt @user'
                }, { quoted: msg });
            }
            
            if (game.turn !== context.sender) {
                return await sock.sendMessage(context.from, {
                    text: '⚠️ Not your turn!'
                }, { quoted: msg });
            }
            
            const position = parseInt(args[0]) - 1;
            
            if (game.board[position] !== '⬜') {
                return await sock.sendMessage(context.from, {
                    text: '⚠️ Position already taken!'
                }, { quoted: msg });
            }
            
            // Make move
            game.board[position] = game.turn === game.player1 ? '❌' : '⭕';
            
            // Check win
            const winner = checkWinner(game.board);
            
            if (winner) {
                activeGames.delete(gameKey);
                const winnerUser = winner === '❌' ? game.player1 : game.player2;
                
                return await sock.sendMessage(context.from, {
                    text: `🎮 **Game Over!**\n\n${renderBoard(game.board)}\n\n🏆 Winner: @${winnerUser.split('@')[0]}!`,
                    mentions: [winnerUser]
                });
            }
            
            // Check draw
            if (!game.board.includes('⬜')) {
                activeGames.delete(gameKey);
                return await sock.sendMessage(context.from, {
                    text: `🎮 **Game Over!**\n\n${renderBoard(game.board)}\n\n🤝 It's a draw!`
                });
            }
            
            // Next turn
            game.turn = game.turn === game.player1 ? game.player2 : game.player1;
            
            await sock.sendMessage(context.from, {
                text: `🎮 **Tic Tac Toe**\n\n${renderBoard(game.board)}\n\nCurrent turn: @${game.turn.split('@')[0]}`,
                mentions: [game.turn]
            });
            
            return;
        }
        
        // Start new game
        if (!mentioned || mentioned.length === 0) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ Please mention someone to play!\nUsage: .ttt @user'
            }, { quoted: msg });
        }
        
        const opponent = mentioned[0];
        
        if (opponent === context.sender) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ You can\'t play with yourself!'
            }, { quoted: msg });
        }
        
        const gameKey = `${context.from}`;
        
        if (activeGames.has(gameKey)) {
            return await sock.sendMessage(context.from, {
                text: '⚠️ A game is already in progress in this group!'
            }, { quoted: msg });
        }
        
        // Create game
        activeGames.set(gameKey, {
            player1: context.sender,
            player2: opponent,
            board: Array(9).fill('⬜'),
            status: 'waiting',
            turn: null
        });
        
        await sock.sendMessage(context.from, {
            text: `🎮 **Tic Tac Toe Invitation!**\n\n@${context.sender.split('@')[0]} challenged @${opponent.split('@')[0]}!\n\n@${opponent.split('@')[0]}, type .ttt accept to start!`,
            mentions: [context.sender, opponent]
        });
    }
};

function renderBoard(board) {
    return `
┏━━━┳━━━┳━━━┓
┃ ${board[0]} ┃ ${board[1]} ┃ ${board[2]} ┃
┣━━━╋━━━╋━━━┫
┃ ${board[3]} ┃ ${board[4]} ┃ ${board[5]} ┃
┣━━━╋━━━╋━━━┫
┃ ${board[6]} ┃ ${board[7]} ┃ ${board[8]} ┃
┗━━━┻━━━┻━━━┛

1️⃣ 2️⃣ 3️⃣
4️⃣ 5️⃣ 6️⃣
7️⃣ 8️⃣ 9️⃣`;
}

function checkWinner(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (let line of lines) {
        const [a, b, c] = line;
        if (board[a] !== '⬜' && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    
    return null;
}
