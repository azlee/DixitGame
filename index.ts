const express = require('express');

const app = express();
app.use(express.static('./public'));
const http = require('http').Server(app);

const io = require('socket.io')(http);
const fs = require('fs');

const port = 3000;

/** ***********************************************
 *
 * Interfaces
 *
************************************************ */
enum GameStatus {
  WAITING_FOR_ALL_PLAYERS,
  WAITING_FOR_CLUE,
  WAITING_FOR_CARDS,
  WAITING_FOR_JUDGING,
}

enum PlayerRole {
  STORYTELLER,
  PLAYER,
}

enum PlayerState {
  // story teller state
  PLAYED_CLUE,
  NOT_PLAYED_CLUE,
  // player state
  PLAYED_CARD,
  NOT_PLAYED_CARD,
  // player and story teller state
  JUDGED_CARD,
  NOT_JUDGED_CARD,
}

enum Move {
  STORY_TELLER_SUBMIT,
}

interface Player {
  cardsInHand: string[];
  id: number;
  name: string;
  role: PlayerRole,
  score: number,
  state: PlayerState,
}

interface GameState {
  cards: string[];
  // cards in play (in center)
  answerCards: string[];
  discardAnswers: string[];
  storyteller: number; // storyteller index
  gameId: string;
  gameStatus: GameStatus;
  numCardsPerPlayer: number;
  players: Map<number, Player>;
  playersStr: string;
  roundNum: number;
  winnerCard: string;
}

interface PlayerGame {
  playerId: number,
  gameRoomCode: string,
}

/** ***********************************************
 *
 * Constants
 *
************************************************ */

// Map of the game room code to the game state
const GAME_ROOMS = new Map<String, GameState>();

// Map of all connected sockets
const SOCKETS_MAP = new Map<String, PlayerGame>();

const CARDS: string[] = [
  'assets/imgs/1.png',
  'assets/imgs/10.jpg',
  'assets/imgs/100.png',
  'assets/imgs/101.png',
  'assets/imgs/102.png',
  'assets/imgs/103.png',
  'assets/imgs/104.png',
  'assets/imgs/105.png',
  'assets/imgs/106.png',
  'assets/imgs/107.png',
  'assets/imgs/108.png',
  'assets/imgs/109.png',
  'assets/imgs/11.jpg',
  'assets/imgs/110.png',
  'assets/imgs/111.png',
  'assets/imgs/112.png',
  'assets/imgs/113.png',
  'assets/imgs/114.png',
  'assets/imgs/115.png',
  'assets/imgs/116.png',
  'assets/imgs/117.png',
  'assets/imgs/118.png',
  'assets/imgs/119.png',
  'assets/imgs/12.jpg',
  'assets/imgs/120.png',
  'assets/imgs/121.png',
  'assets/imgs/122.png',
  'assets/imgs/123.png',
  'assets/imgs/124.png',
  'assets/imgs/125.png',
  'assets/imgs/126.png',
  'assets/imgs/127.png',
  'assets/imgs/128.png',
  'assets/imgs/129.png',
  'assets/imgs/13.jpg',
  'assets/imgs/130.png',
  'assets/imgs/131.png',
  'assets/imgs/132.png',
  'assets/imgs/133.jpg',
  'assets/imgs/134.jpg',
  'assets/imgs/135.jpg',
  'assets/imgs/136.jpg',
  'assets/imgs/137.jpg',
  'assets/imgs/138.jpg',
  'assets/imgs/139.jpg',
  'assets/imgs/14.jpg',
  'assets/imgs/140.jpg',
  'assets/imgs/141.jpg',
  'assets/imgs/142.jpg',
  'assets/imgs/143.jpg',
  'assets/imgs/144.jpg',
  'assets/imgs/145.jpg',
  'assets/imgs/146.jpg',
  'assets/imgs/147.jpg',
  'assets/imgs/148.jpg',
  'assets/imgs/149.jpg',
  'assets/imgs/15.jpg',
  'assets/imgs/150.jpg',
  'assets/imgs/151.jpg',
  'assets/imgs/152.jpg',
  'assets/imgs/153.jpg',
  'assets/imgs/154.jpg',
  'assets/imgs/155.jpg',
  'assets/imgs/156.jpg',
  'assets/imgs/157.jpg',
  'assets/imgs/158.jpg',
  'assets/imgs/159.jpg',
  'assets/imgs/16.jpg',
  'assets/imgs/160.jpg',
  'assets/imgs/161.jpg',
  'assets/imgs/162.jpg',
  'assets/imgs/163.jpg',
  'assets/imgs/164.jpg',
  'assets/imgs/165.jpg',
  'assets/imgs/166.jpg',
  'assets/imgs/167.jpg',
  'assets/imgs/168.jpg',
  'assets/imgs/169.jpg',
  'assets/imgs/17.jpg',
  'assets/imgs/170.jpg',
  'assets/imgs/171.jpg',
  'assets/imgs/172.jpg',
  'assets/imgs/173.jpg',
  'assets/imgs/174.jpg',
  'assets/imgs/175.jpg',
  'assets/imgs/176.jpg',
  'assets/imgs/177.jpg',
  'assets/imgs/178.jpg',
  'assets/imgs/179.jpg',
  'assets/imgs/18.jpg',
  'assets/imgs/180.jpg',
  'assets/imgs/181.jpg',
  'assets/imgs/182.jpg',
  'assets/imgs/183.jpg',
  'assets/imgs/184.jpg',
  'assets/imgs/185.jpg',
  'assets/imgs/186.jpg',
  'assets/imgs/187.jpg',
  'assets/imgs/188.jpg',
  'assets/imgs/189.jpg',
  'assets/imgs/19.jpg',
  'assets/imgs/190.jpg',
  'assets/imgs/191.jpg',
  'assets/imgs/192.jpg',
  'assets/imgs/193.jpg',
  'assets/imgs/194.jpg',
  'assets/imgs/195.jpg',
  'assets/imgs/196.jpg',
  'assets/imgs/197.jpg',
  'assets/imgs/198.jpg',
  'assets/imgs/199.jpg',
  'assets/imgs/2.png',
  'assets/imgs/20.jpg',
  'assets/imgs/200.jpg',
  'assets/imgs/201.jpg',
  'assets/imgs/202.jpg',
  'assets/imgs/203.jpg',
  'assets/imgs/204.jpg',
  'assets/imgs/205.jpg',
  'assets/imgs/206.jpg',
  'assets/imgs/207.jpg',
  'assets/imgs/208.jpg',
  'assets/imgs/209.jpg',
  'assets/imgs/21.jpg',
  'assets/imgs/210.jpg',
  'assets/imgs/211.jpg',
  'assets/imgs/212.jpg',
  'assets/imgs/213.jpg',
  'assets/imgs/214.jpg',
  'assets/imgs/215.jpg',
  'assets/imgs/216.jpg',
  'assets/imgs/217.jpg',
  'assets/imgs/218.jpg',
  'assets/imgs/219.jpg',
  'assets/imgs/22.jpg',
  'assets/imgs/220.jpg',
  'assets/imgs/221.jpg',
  'assets/imgs/222.jpg',
  'assets/imgs/223.jpg',
  'assets/imgs/224.jpg',
  'assets/imgs/225.jpg',
  'assets/imgs/23.jpg',
  'assets/imgs/24.jpeg',
  'assets/imgs/25.jpg',
  'assets/imgs/26.jpg',
  'assets/imgs/27.jpeg',
  'assets/imgs/28.jpg',
  'assets/imgs/29.jpg',
  'assets/imgs/3.png',
  'assets/imgs/30.jpg',
  'assets/imgs/31.png',
  'assets/imgs/32.png',
  'assets/imgs/33.jpg',
  'assets/imgs/34.jpg',
  'assets/imgs/35.jpg',
  'assets/imgs/37.jpeg',
  'assets/imgs/39.png',
  'assets/imgs/4.png',
  'assets/imgs/40.jpg',
  'assets/imgs/41.jpg',
  'assets/imgs/42.png',
  'assets/imgs/43.jpg',
  'assets/imgs/44.jpeg',
  'assets/imgs/45.png',
  'assets/imgs/46.png',
  'assets/imgs/47.jpeg',
  'assets/imgs/48.jpg',
  'assets/imgs/49.jpg',
  'assets/imgs/5.png',
  'assets/imgs/50.jpg',
  'assets/imgs/51.jpg',
  'assets/imgs/52.jpg',
  'assets/imgs/54.jpg',
  'assets/imgs/55.jpg',
  'assets/imgs/56.jpg',
  'assets/imgs/57.jpg',
  'assets/imgs/58.jpg',
  'assets/imgs/59.jpeg',
  'assets/imgs/6.png',
  'assets/imgs/60.jpg',
  'assets/imgs/61.jpg',
  'assets/imgs/62.jpg',
  'assets/imgs/64.jpg',
  'assets/imgs/65.jpg',
  'assets/imgs/66.png',
  'assets/imgs/67.png',
  'assets/imgs/68.png',
  'assets/imgs/69.png',
  'assets/imgs/70.png',
  'assets/imgs/71.png',
  'assets/imgs/73.png',
  'assets/imgs/74.png',
  'assets/imgs/75.png',
  'assets/imgs/76.png',
  'assets/imgs/77.png',
  'assets/imgs/78.png',
  'assets/imgs/79.png',
  'assets/imgs/8.jpg',
  'assets/imgs/80.png',
  'assets/imgs/81.png',
  'assets/imgs/82.png',
  'assets/imgs/83.png',
  'assets/imgs/85.png',
  'assets/imgs/86.png',
  'assets/imgs/87.png',
  'assets/imgs/88.png',
  'assets/imgs/89.png',
  'assets/imgs/90.png',
  'assets/imgs/91.png',
  'assets/imgs/92.png',
  'assets/imgs/93.png',
  'assets/imgs/94.png',
  'assets/imgs/95.png',
  'assets/imgs/96.png',
  'assets/imgs/97.png',
  'assets/imgs/98.png',
];

const NUMBER_CARDS_PER_PLAYER = 6;

const MAX_NUMBER_PLAYERS = 8;

/** **************************************************************************
 *
 * Utility functions
 *
 *************************************************************************** */

/**
* Randomly shuffle an array
* https://stackoverflow.com/a/2450976/1293256
* @param  {Array} array The array to shuffle
* @return {String}      The first item in the shuffled array
*/
function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue; let
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

/**
 * Generate a random room code of 4 uppercase letters
 */
function generateRoomCode(): string {
  const len = 4;
  const arr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = len; i > 0; i -= 1) {
    code += arr[Math.floor(Math.random() * arr.length)];
  }
  if (GAME_ROOMS.get(code)) {
    return generateRoomCode();
  }
  return code;
}

function initializeGameState(gameId): GameState {
  const gameState: GameState = {
    cards: shuffle(CARDS.slice()),
    // cards in play (in center)
    answerCards: [],
    discardAnswers: [],
    storyteller: 1,
    gameId,
    gameStatus: GameStatus.WAITING_FOR_CLUE,
    numCardsPerPlayer: NUMBER_CARDS_PER_PLAYER,
    players: new Map<number, Player>(),
    playersStr: '',
    roundNum: 1,
    winnerCard: null,
  };
  return gameState;
}

/**
 * Create a new game room and set it in the game room map
 * Returns the game room code
 */
function createGameRoom(): GameState {
  const gameRoomCode: string = generateRoomCode();
  const gameState: GameState = initializeGameState(gameRoomCode);
  GAME_ROOMS.set(gameRoomCode, gameState);
  return gameState;
}

/**
 * Shuffle and move all the discard cards back to the deck
 * @param gameRoomCode game room code
 */
function moveDiscardPileToDeck(gameRoomCode: string) {
  const discard: string[] = shuffle(GAME_ROOMS.get(gameRoomCode).discardAnswers.slice());
  GAME_ROOMS.get(gameRoomCode).cards.concat(discard);
  GAME_ROOMS.get(gameRoomCode).discardAnswers = [];
}

function getCards(gameRoomCode: string, numberCards: number) {
  const cards: string[] = [];
  const gameState: GameState = GAME_ROOMS.get(gameRoomCode);
  let numCards = numberCards;
  while (numCards > 0) {
    const card: string = gameState.cards.pop();
    if (card === null) {
      moveDiscardPileToDeck(gameRoomCode);
    }
    cards.push(card);
    numCards -= 1;
  }
  return cards;
}

function createPlayer(gameRoomCode: string, name: string) {
  const gameState: GameState = GAME_ROOMS.get(gameRoomCode);
  const role = gameState.players.size === 0 ? PlayerRole.STORYTELLER : PlayerRole.PLAYER;
  const cards: string[] = getCards(gameRoomCode, NUMBER_CARDS_PER_PLAYER);
  const player: Player = {
    cardsInHand: cards,
    id: gameState.players.size + 1,
    name,
    role,
    score: 0,
    state: role === PlayerRole.STORYTELLER ? PlayerState.NOT_PLAYED_CLUE
      : PlayerState.NOT_PLAYED_CARD,
  };
  // add player to the game room
  gameState.players.set(player.id, player);
  return player;
}

function addPlayerSocketIdToMap(socketId: string, gameRoomId: string, playerId: number) {
  SOCKETS_MAP.set(socketId, { playerId, gameRoomCode: gameRoomId });
}

function submitStorytellerCard(gameRoomId: string,
  cardNum: number,
  playerId: number,
  clue: string) {
  const gameState: GameState = GAME_ROOMS.get(gameRoomId);
  const player: Player = gameState.players.get(playerId);
  // put the card in the middle
  gameState.answerCards.push(player.cardsInHand[cardNum]);
  // replace the card that the storyplayer submitted with a new card
  const newCards: string[] = getCards(gameRoomId, 1);
  player.cardsInHand[cardNum] = newCards[0];
  // move to next game state
  gameState.gameStatus = GameStatus.WAITING_FOR_CARDS;
  // set the player state
  player.state = PlayerState.PLAYED_CLUE;
}

function applyMove(move: Move, gameRoomId: string, playerId: number, params: any) {
  if (move === Move.STORY_TELLER_SUBMIT) {
    // storyteller is submitting card & clue
    submitStorytellerCard(gameRoomId, params.cardNum, playerId, params.clue);
  }
  sendStateUpdate(gameRoomId);
}

/** **************************************************************************
 *
 * Server Socket connection
 *
 *************************************************************************** */

function sendStateUpdate(gameRoomCode: string) {
  const gameState: GameState = GAME_ROOMS.get(gameRoomCode);
  if (gameState) {
    const players = new Map(gameState.players);
    gameState.playersStr = JSON.stringify(Array.from(players));
    io.sockets.emit(gameRoomCode, { state: gameState });
    gameState.players = players;
  }
}

io.on('connection', (socket) => {
  console.log(`new connection ${socket.id}`);

  socket.on('createGame', (param) => {
    try {
      // create game
      const gameState: GameState = createGameRoom();
      // create player and add to gameRoom
      const player = createPlayer(gameState.gameId, param.name);
      // add player to socket map
      addPlayerSocketIdToMap(socket.id, gameState.gameId, player.id);
      console.log(`created game room ${gameState.gameId}`);
      io.to(socket.id).emit('createGameSuccess', gameState.gameId);
      sendStateUpdate(gameState.gameId);
      // create new player
    } catch (err) {
      console.error('create game failure');
      console.error(err);
    }
  });

  socket.on('move', (params) => {
    console.log('params are');
    console.log(params);
    applyMove(Move.STORY_TELLER_SUBMIT, params.gameRoom, params.playerId, params.params);
  });
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/default.html`);
});

http.listen(port, () => {
  console.log(`Listening on *: ${port}`);
});
