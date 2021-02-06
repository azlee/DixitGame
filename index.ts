const express = require('express');

const app = express();
app.use(express.static('./public'));
const http = require('http').Server(app);

const io = require('socket.io')(http);
const fs = require('fs');

const port = 3000;

/** ***********************************************
 *
 * Interfaces & enums
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
  // non story teller submit card
  PLAYER_SUBMIT_CARD,
}

interface Player {
  cardsInHand: string[];
  id: number;
  img: string;
  name: string;
  role: PlayerRole,
  score: number,
  state: PlayerState,
  submittedCard: string;
}

interface GameState {
  cards: string[];
  clue: string;
  // cards in play (in the center)
  answerCards: string[];
  discardAnswers: string[];
  storyteller: number; // storyteller index
  gameId: string;
  gameStatus: GameStatus;
  numCardsPerPlayer: number;
  players: Map<number, Player>;
  playersStr: string;
  roundNum: number;
  storytellerCard: string;
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

const NUM_CARDS = 220;

const NUMBER_CARDS_PER_PLAYER = 6;

const MAX_NUMBER_PLAYERS = 8;

/** **************************************************************************
 *
 * Utility functions
 *
 *************************************************************************** */

/**
  * Get the card at index i
  * (card imgs are numbered 1 to 220)
  * @param index
  */
function getCard(index : number) : string | undefined {
  if (index < 1 || index > 220) {
    return undefined;
  }
  return `assets/imgs/${index}.png`;
}

/**
 * Get All cards in the deck
 */
function getAllCards(): string[] {
  const cards: string[] = [];
  for (let i = 1; i <= NUM_CARDS; i += 1) {
    cards.push(getCard(i));
  }
  return cards;
}

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
  // return code;
  return 'AAAA';
}

/**
 * Initialize game state and return it
 * @param gameId
 */
function initializeGameState(gameId): GameState {
  const gameState: GameState = {
    cards: shuffle(getAllCards().slice()),
    clue: '',
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
    storytellerCard: '',
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

/**
 * Pull numberCards cards from the card deck for the game
 * @param gameRoomCode game room code
 * @param numberCards number of cards to pull from the deck
 */
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

/**
 * Create a player for the game and return it
 */
function createPlayer(gameRoomCode: string, name: string): Player {
  const gameState: GameState = GAME_ROOMS.get(gameRoomCode);
  const role = gameState.players.size === 0 ? PlayerRole.STORYTELLER : PlayerRole.PLAYER;
  const cards: string[] = getCards(gameRoomCode, NUMBER_CARDS_PER_PLAYER);
  const player: Player = {
    cardsInHand: cards,
    id: gameState.players.size + 1,
    img: 'assets/imgs/cat.png',
    name,
    role,
    score: 0,
    state: role === PlayerRole.STORYTELLER ? PlayerState.NOT_PLAYED_CLUE
      : PlayerState.NOT_PLAYED_CARD,
    submittedCard: '',
  };
  // add player to the game room
  gameState.players.set(player.id, player);
  return player;
}

function addPlayerSocketIdToMap(socketId: string, gameRoomId: string, playerId: number) {
  SOCKETS_MAP.set(socketId, { playerId, gameRoomCode: gameRoomId });
}

/**
 * Submit story teller card & clue
 * @param gameRoomId game room id
 * @param cardNum card num
 * @param playerId player id
 * @param clue clue from storyteller
 */
function submitStorytellerCard(gameRoomId: string,
  cardNum: number,
  playerId: number,
  clue: string) {
  const gameState: GameState = GAME_ROOMS.get(gameRoomId);
  const player: Player = gameState.players.get(playerId);
  // put the card in the middle
  gameState.answerCards.push(player.cardsInHand[cardNum]);
  // set the card
  gameState.storytellerCard = player.cardsInHand[cardNum];
  // replace the card that the storyplayer submitted with a new card
  const newCards: string[] = getCards(gameRoomId, 1);
  player.cardsInHand[cardNum] = newCards[0];
  // move to next game state
  gameState.gameStatus = GameStatus.WAITING_FOR_CARDS;
  // set the clue
  gameState.clue = clue;
  // set the player state
  player.state = PlayerState.PLAYED_CLUE;
}

/**
 * Submit card from non story teller
 * @param gameRoomId game room id
 * @param playerId player id
 * @param cardNum card number
 */
function submitCard(gameRoomId: string, playerId: number, cardNum: string) {
  const gameState: GameState = GAME_ROOMS.get(gameRoomId);
  const player: Player = gameState.players.get(playerId);
  // put the card in the middle
  gameState.answerCards.push(player.cardsInHand[cardNum]);
  // replace the card that the player submitted with a new card
  const newCards: string[] = getCards(gameRoomId, 1);
  player.cardsInHand[cardNum] = newCards[0];
  // move to next game state
  if (gameState.answerCards.length === gameState.players.size) {
    // if all players submitted card
    gameState.gameStatus = GameStatus.WAITING_FOR_JUDGING;
    // shuffle the answer cards
    shuffle(gameState.answerCards);
  } else {
    gameState.gameStatus = GameStatus.WAITING_FOR_CARDS;
  }
  // set the player state
  player.state = PlayerState.PLAYED_CLUE;
}

/**
 * Apply the move
 * @param move
 * @param gameRoomId
 * @param playerId
 * @param params
 */
function applyMove(move: Move, gameRoomId: string, playerId: number, params: any) {
  if (move === Move.STORY_TELLER_SUBMIT) {
    // storyteller is submitting card & clue
    submitStorytellerCard(gameRoomId, params.cardNum, playerId, params.clue);
  } else if (move === Move.PLAYER_SUBMIT_CARD) {
    submitCard(gameRoomId, playerId, params.cardNum);
  }
  sendStateUpdate(gameRoomId);
}

/** **************************************************************************
 *
 * Server Socket connection
 *
 *************************************************************************** */

/**
  * Send game state update to the game room
  * @param gameRoomCode
  */
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
      // TODO: allow more than one game and do socket.on('joinGame')
      if (GAME_ROOMS.size === 0) {
        const gameState: GameState = createGameRoom();
        // create player and add to gameRoom
        const player: Player = createPlayer(gameState.gameId, param.name);
        // add player to socket map
        addPlayerSocketIdToMap(socket.id, gameState.gameId, player.id);
        console.log(`created game room ${gameState.gameId}`);
        io.to(socket.id).emit('createGameSuccess', gameState.gameId);
        sendStateUpdate(gameState.gameId);
      } else {
        console.log('join game success');
        const gameState: GameState = GAME_ROOMS.values().next().value;
        // create new player and add to existing game room
        const player: Player = createPlayer(gameState.gameId, param.name);
        // add player to socket map
        addPlayerSocketIdToMap(socket.id, gameState.gameId, player.id);
        // send state update
        sendStateUpdate(gameState.gameId);
        // send player their player id as sign that they've joined successfully
        io.to(socket.id).emit(gameState.gameId, { joinGameSuccess: true, playerId: player.id });
      }
    } catch (err) {
      console.error(`create game failure${err}`);
    }
  });

  socket.on('move', (params) => {
    applyMove(params.move, params.gameRoom, params.playerId, params.params);
  });
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/default.html`);
});

http.listen(port, () => {
  console.log(`Listening on *: ${port}`);
});
