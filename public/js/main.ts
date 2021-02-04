/** **************************************************************************
 *
 *
 * Interfaces & Constants
 *
 *
 *************************************************************************** */
interface Rectangle {
    x: number;
    y: number;
    w: number;
    h: number;
}

const rectangles = [
  {
    x: 0.8803706823925863, y: 0.5661881977671451, w: 0.07034540859309182, h: 0.3094098883572568,
  },
  {
    x: 0.8079191238416176, y: 0.6475279106858054, w: 0.04844144903117102, h: 0.20733652312599682,
  },
  {
    x: 0.7459983150800337, y: 0.6028708133971292, w: 0.05939342881213142, h: 0.21052631578947367,
  },
  {
    x: 0.6882898062342039, y: 0.6650717703349283, w: 0.051811288963774224, h: 0.20733652312599682,
  },
  {
    x: 0.6297388374052233, y: 0.7527910685805422, w: 0.04844144903117102, h: 0.2025518341307815,
  },
  {
    x: 0.5812973883740522, y: 0.5789473684210527, w: 0.04507160909856782, h: 0.16267942583732056,
  },
  {
    x: 0.5370682392586352, y: 0.7432216905901117, w: 0.05265374894692502, h: 0.22807017543859648,
  },
  {
    x: 0.4721988205560236, y: 0.631578947368421, w: 0.05349620893007582, h: 0.1547049441786284,
  },
  {
    x: 0.43091828138163435, y: 0.7687400318979266, w: 0.05012636899747262, h: 0.189792663476874,
  },
  {
    x: 0.36773378264532436, y: 0.6331738437001595, w: 0.06318449873631002, h: 0.18819776714513556,
  },
  {
    x: 0.3007582139848357, y: 0.7240829346092504, w: 0.04928390901432182, h: 0.15151515151515152,
  },
  {
    x: 0.22325189553496208, y: 0.6634768740031898, w: 0.06444818871103622, h: 0.23125996810207336,
  },
  {
    x: 0.17059814658803707, y: 0.7256778309409888, w: 0.05054759898904802, h: 0.15789473684210525,
  },
  {
    x: 0.09309182813816344, y: 0.810207336523126, w: 0.05812973883740522, h: 0.16586921850079744,
  },
  {
    x: 0.039174389216512215, y: 0.6267942583732058, w: 0.05307497893850042, h: 0.14354066985645933,
  },
  {
    x: 0.04675652906486942, y: 0.30303030303030304, w: 0.04380791912384162, h: 0.16108452950558214,
  },
  {
    x: 0.11036225779275484, y: 0.20095693779904306, w: 0.05054759898904802, h: 0.19776714513556617,
  },
  {
    x: 0.17860151642796968, y: 0.02073365231259968, w: 0.051390058972198824, h: 0.15311004784688995,
  },
  {
    x: 0.2632687447346251, y: 0.12280701754385964, w: 0.03706823925863521, h: 0.16905901116427433,
  },
  {
    x: 0.3112889637742207, y: 0.28548644338118023, w: 0.040016849199663015, h: 0.17862838915470494,
  },
  {
    x: 0.35636057287278855, y: 0.29505582137161085, w: 0.04633529907329402, h: 0.16427432216905902,
  },
  {
    x: 0.38416175231676497, y: 0.09409888357256778, w: 0.04886267902274642, h: 0.1547049441786284,
  },
  {
    x: 0.45155855096882896, y: 0.1547049441786284, w: 0.051390058972198824, h: 0.15151515151515152,
  },
  {
    x: 0.516849199663016, y: 0.049441786283891544, w: 0.040859309182813816, h: 0.20733652312599682,
  },
  {
    x: 0.5859309182813817, y: 0.04146730462519936, w: 0.039595619208087615, h: 0.20893141945773525,
  },
  {
    x: 0.6406908171861837, y: 0.07177033492822966, w: 0.039595619208087615, h: 0.14832535885167464,
  },
  {
    x: 0.6722830665543387, y: 0.22966507177033493, w: 0.04380791912384162, h: 0.14035087719298245,
  },
  {
    x: 0.7287278854254423, y: 0.18819776714513556, w: 0.040859309182813816, h: 0.15629984051036683,
  },
  {
    x: 0.7754844144903117, y: 0.14035087719298245, w: 0.05602358887952822, h: 0.19138755980861244,
  },
  {
    x: 0.8407750631844987, y: 0.14513556618819776, w: 0.04717775905644482, h: 0.16267942583732056,
  },
  {
    x: 0.8909014321819714, y: 0.06539074960127592, w: 0.05518112889637742, h: 0.215311004784689,
  },
];

/** **************************************************************************
 *
 *
 * Game State keeps track of all the game's state - only the game server updates the state
 *
 *
 *************************************************************************** */
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
  // story teller submit card
  STORY_TELLER_SUBMIT,
}

enum Instruction {
  STORYTELLER = 'You are the storyteller! Select a card and clue.',
  STORYTELLER_WAIT = 'Wait for other players to submit a card.',
  PLAYERS_WAIT_STORYTELLER = '%s is the storyteller! Wait for them to submit a card & clue.',
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

let GAME_STATE: GameState = {
  cards: [],
  answerCards: [],
  discardAnswers: [],
  storyteller: null,
  gameId: null,
  gameStatus: null,
  numCardsPerPlayer: 6,
  players: new Map(),
  playersStr: null,
  roundNum: 1,
  winnerCard: null,
};

let playerId: number = null;

/** **************************************************************************
 *
 *
 * Any client side rendering
 *
 *
 *************************************************************************** */

/**
 * Get player with id
 * @param {number} id
 */
function getPlayer(id: number): Player {
  return GAME_STATE.players.get(id);
}

/**
 * Enable or disable submit button for storyteller clue
 */
function addDisableEnableButton() {
  $('#clueButton').prop('disabled', true);
  const clueBox = document.getElementById('clueBox') !== null;

  function validateSubmitButton() {
    const isNameEntered = $('#clueBox').val().trim() !== '';
    const isCardSelected = $('input[type=radio]:checked').size() > 0;
    $('#clueButton').prop('disabled', !isNameEntered || !isCardSelected || getPlayer(playerId).state === PlayerState.PLAYED_CLUE);
  }

  $('input[type=radio]:checked').change(validateSubmitButton);
  $('#clueBox').on('keyup', validateSubmitButton);
  if (clueBox) {
    $('#clueBox').on('keyup', validateSubmitButton);
  }
}

/**
 * Apply a move
 */
function applyMove(move: Move) {
  // Submit the storyteller's card & clue
  const params: any = {};
  if (move === Move.STORY_TELLER_SUBMIT) {
    // get the selected card
    let selectedCardIndex = 0;
    const { cardsInHand } = getPlayer(playerId);
    for (let i = 0; i < cardsInHand.length; i += 1) {
      if (document.getElementById(`card-${i}`).checked) {
        selectedCardIndex = i;
        break;
      }
    }
    params.cardNum = selectedCardIndex;
    params.clue = document.getElementById('clueBox').value;
  }
  socket.emit('move', {
    gameRoom: GAME_STATE.gameId,
    params,
    playerId,
    move,
  });
}

/**
 * Render the instruction for the player
 */
function renderInstruction() {
  const instructionDiv = document.getElementById('instruction');
  const message: string = '';
  if (GAME_STATE.gameStatus === GameStatus.WAITING_FOR_CLUE) {
    if (playerId === GAME_STATE.storyteller) {
      instructionDiv.innerHTML = Instruction.STORYTELLER;
    } else {
      instructionDiv.innerHTML = Instruction.PLAYERS_WAIT_STORYTELLER;
    }
  } else if (GAME_STATE.gameStatus === GameStatus.WAITING_FOR_CARDS) {
    if (playerId === GAME_STATE.storyteller) {
      instructionDiv.innerHTML = Instruction.STORYTELLER_WAIT;
    }
  }
}

/**
 * Render the cards in the player's hands
 */
function renderCardsInHand() {
  const isStoryTeller: boolean = GAME_STATE.storyteller === playerId;
  const { cardsInHand } = getPlayer(playerId);
  const cardBlock = document.getElementById('cardBlock');
  cardBlock.innerHTML = '';
  for (let i = 0; i < cardsInHand.length; i += 1) {
    const card: string = cardsInHand[i];
    const checkBox = document.createElement('input');
    checkBox.type = 'radio';
    checkBox.name = 'selectedCard';
    checkBox.id = `card-${i}`;
    const label = document.createElement('label');
    label.htmlFor = `card-${i}`;
    const cardDoc = document.createElement('div');
    cardDoc.className = 'card';
    const imgDoc = document.createElement('img');
    imgDoc.src = card;
    cardBlock.append(checkBox);
    label.append(imgDoc);
    cardDoc.append(label);
    cardBlock.append(cardDoc);
  }
  if (isStoryTeller) {
    // insert input text box
    const clueLabel = document.createElement('label');
    clueLabel.htmlFor = 'clueBox';
    clueLabel.innerHTML = 'Story/Clue:&nbsp;';
    const clueBox = document.createElement('textarea');
    clueBox.maxLength = 125;
    clueBox.rows = 2;
    clueBox.cols = 20;
    clueBox.id = 'clueBox';
    const button = document.createElement('button');
    button.id = 'clueButton';
    button.innerHTML = 'Submit';
    const storyTellerClue = document.getElementById('storyTellerClue');
    storyTellerClue.innerHTML = '';
    // add event listener to submit button
    button.addEventListener('click', () => {
      applyMove(Move.STORY_TELLER_SUBMIT);
    });
    storyTellerClue.append(clueLabel);
    storyTellerClue.append(clueBox);
    storyTellerClue.append(button);
    addDisableEnableButton();
  }
}

/**
 * Remove the clue box if the storyteller has submitted their clue & card
 */
function removeClueBox() {
  const storyTellerClue = document.getElementById('storyTellerClue');
  if (storyTellerClue && GAME_STATE.storyteller === playerId && getPlayer(playerId).state !== PlayerState.NOT_PLAYED_CLUE) {
    storyTellerClue.remove();
  }
}

/**
 * Render the entire board
 * Only render components where the game state has changed
 * @param: {GameState} - prevState previous game state
 */
function renderBoard(prevState: GameState) {
  const cardHandChanged = !prevState.players.get(playerId)
  || getPlayer(playerId).cardsInHand !== prevState.players.get(playerId).cardsInHand;
  if (cardHandChanged) {
    renderCardsInHand();
  }
  renderInstruction();
  removeClueBox();
}

function renderEntireBoard() {
  renderCardsInHand();
  renderInstruction();
  removeClueBox();
}

/** **************************************************************************
 *
 *
 * Client side sockets
 *
 *
 *************************************************************************** */
const socket = io();

function listenToRoomNotifications(roomCode: string) {
  socket.on(roomCode, (msg: any) => {
    if (msg.state) {
      const prevGameState: GameState = { ...GAME_STATE };
      GAME_STATE = msg.state;
      GAME_STATE.players = new Map(JSON.parse(msg.state.playersStr));
      if (JSON.stringify(prevGameState) !== JSON.stringify(GAME_STATE)) {
        if (playerId != null) {
        }
      }
      renderEntireBoard();
    }
    if (msg.joinGameSuccess) {
      playerId = msg.playerId;
    }
  });
}

function createGame(name, numPlayers) {
  socket.emit('createGame', { name: name.trim(), numPlayers });
  socket.on('createGameSuccess', (gameRoom) => {
    playerId = 1;
    console.log('create game success');
    console.log(`game room ${gameRoom}`);
    listenToRoomNotifications(gameRoom);
  });
}

createGame('amberTest', 2);
