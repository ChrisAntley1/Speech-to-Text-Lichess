/**
 * Must keep track of USER's pieces, not so much opponent's pieces; HOWEVER, must recognize when opponent has captured one of our pieces.
 * To do this, keep a board map; square coordinate will be the key, and will specify which of the user's pieces resides there.
 * When new game data comes in, update according to whether it is our turn or not (if index of move in translatedMoveList is odd(white) or even(black))
 * 
 * If OUR turn, update the position of one of our pieces. If castles, update both king and rook location. If promotion, update piece value. 
 * 
 * If OPPONENTS turn, read the square their piece has moved to; if one of our pieces resides at that square, delete it from board map (captured!)
 * 
 * 
 * PROBLEM: SAN doesn't require you to specify between 2 same-type pieces if both pieces can technically access a square, but one is blocked
 * 
 * EXAMPLE: You have 2 rooks, 1 on a1, the other on a8. Your opponent has a pawn on a2 and a queen on a4. Ra4 is a valid move; knows that the blocked rook
 * is not a candidate piece.
 * 
 * Revised Requirements:
 * 
 * Keep track of whole board, including user and opponent's pieces. 
 *      - handle special special cases: castles (for both sides) and promotions
 *      - in ALL cases where the API returns an error: inform user that take-backs can break piece recognition; advise refreshing; 
 *      - also advise to check if valid move since game won't give as much feedback as clicking and moving a piece would
 *      - keep seperate lists of each piece type; each entry will simply be the location of that piece
 *      - must keep track of opponent's piece type to check for pins to king
 * Try and generate valid UCI move based on the board state and the provided UCI move.
 * 
 * For all pieces:
 *      - do NOT have to check if target square is occupied. User is simply submitting an invalid move; API will handle
 *      - DO have to check for castling; might include flag to stop this check once castling occurs. 
 * For pawns: 
 *      - user is white and moves a pawn to the 4th rank: check 3rd and THEN 2nd ranks for pawns on that column
 *      - user is black and moves a pawn to the 5th rank: check 6th and THEN 7th rank for pawns on that column
 *          ** for either of the above case where a 2 square pawn move appears to be the request, no need to check if piece is blocked. 
 *              User is simply submitting an invalid move; API will handle
 *      - else assume pawn's location is one square behind target square 
 * 
 * For queens/bishops/rooks/knights:
 *      0. check if a piece of the target piece type exists in user's piece list
 *          -- if NOT, inform user target piece was not found; advise that they should refresh page (since we know take-backs will not be tracked)
 *      
 *      1. check if there is only one piece of the target piece type; if so, simply generate the move regardless of validity
 * 
 *      2. if MORE than one, check if there is identifying information specifying the piece location
 *          -- if this successfully narrows it down to one piece, simply generate the move regardless of validity
 *          -- technically NOT valid SAN format in case where piece identification is not necessary??
 *      
 *      3. if MORE than one AND no identifying information, only NOW do we read the board state and determine which piece could move to that square:
 *          -- if only one piece has line of sight to target square, generate move using this piece. Line of sight means NOT BLOCKED!
 *              **for knights: if only 1 knight is within knight's range of the target square
 *      
 ̶*̶ ̶ ̶ ̶ ̶ ̶ ̶4̶.̶ ̶i̶f̶ ̶m̶o̶r̶e̶ ̶t̶h̶a̶n̶ ̶o̶n̶e̶ ̶h̶a̶s̶ ̶l̶i̶n̶e̶ ̶o̶f̶ ̶s̶i̶t̶e̶ ̶(̶k̶n̶i̶g̶h̶t̶s̶:̶ ̶i̶s̶ ̶w̶i̶t̶h̶i̶n̶ ̶r̶a̶n̶g̶e̶)̶ ̶o̶f̶ ̶t̶a̶r̶g̶e̶t̶ ̶s̶q̶u̶a̶r̶e̶,̶ ̶c̶h̶e̶c̶k̶ ̶f̶o̶r̶ ̶p̶i̶n̶s̶ ̶t̶o̶ ̶k̶i̶n̶g
*̶ ̶ ̶ ̶ ̶ ̶ ̶ ̶ ̶ ̶ ̶-̶-̶ ̶i̶f̶ ̶p̶i̶e̶c̶e̶ ̶h̶a̶s̶ ̶l̶i̶n̶e̶ ̶o̶f̶ ̶s̶i̶g̶h̶t̶ ̶t̶o̶ ̶o̶w̶n̶ ̶k̶i̶n̶g̶ ̶A̶N̶D̶ ̶e̶n̶e̶m̶y̶ ̶p̶i̶e̶c̶e̶ ̶i̶s̶ ̶a̶t̶t̶a̶c̶k̶i̶n̶g̶ ̶o̶n̶ ̶t̶h̶a̶t̶ ̶c̶o̶l̶u̶m̶n̶/̶r̶o̶w̶/̶d̶i̶a̶g̶o̶n̶a̶l̶,̶ ̶r̶e̶m̶o̶v̶e̶ ̶a̶s̶ ̶c̶a̶n̶d̶i̶d̶a̶t̶e̶ ̶p̶i̶e̶c̶e̶
̶*̶ ̶ ̶ ̶ ̶ ̶ ̶ ̶ ̶ ̶ ̶-̶-̶ ̶i̶f̶ ̶o̶n̶l̶y̶ ̶o̶n̶e̶ ̶p̶i̶e̶c̶e̶ ̶r̶e̶m̶a̶i̶n̶s̶ ̶t̶h̶a̶t̶ ̶c̶a̶n̶ ̶l̶e̶g̶a̶l̶l̶y̶ ̶m̶o̶v̶e̶,̶ ̶g̶e̶n̶e̶r̶a̶t̶e̶ ̶m̶o̶v̶e̶ ̶u̶s̶i̶n̶g̶ ̶t̶h̶i̶s̶ ̶p̶i̶e̶c̶e̶*     
*      
*      4. We DO NOT check for pins! Even though Lichess records moves in SAN format without specifying the not-pinned piece, user is 
*          expected to specify the piece when using the text input box. We will assume the same requirement; do not want our extension 
*          to "assist" the user by automatically picking the valid piece.
*          -- fuck yeah less work lmao
* 
*      5. if at this point, then all hope is lost. 
*          -- user is either not giving enough information to specify their target piece, or our board state is incorrect
*          -- probably inform user of both
*          -- send move using arbitrary piece of target type regardless?
*/
let INVALID_MOVE = 'Invalid move detected; your move did not follow any expected SAN or UCI formats.'
let castleMap;
// let translateColumnMap;

let movesList = [];
let userColor = '';
let pieceRow = 0;
let userPieceMap;
let kingSideCastle;
let queenSideCastle;

let board = {
    'a': [0, 'wR', 'wp', '--', '--', '--', '--', 'bp', 'bR'],
    'b': [0, 'wN', 'wp', '--', '--', '--', '--', 'bp', 'bN'],
    'c': [0, 'wB', 'wp', '--', '--', '--', '--', 'bp', 'bB'],
    'd': [0, 'wQ', 'wp', '--', '--', '--', '--', 'bp', 'bQ'],
    'e': [0, 'wK', 'wp', '--', '--', '--', '--', 'bp', 'bK'],
    'f': [0, 'wB', 'wp', '--', '--', '--', '--', 'bp', 'bB'],
    'g': [0, 'wN', 'wp', '--', '--', '--', '--', 'bp', 'bN'],
    'h': [0, 'wR', 'wp', '--', '--', '--', '--', 'bp', 'bR']}; 

const columns = ['no!','a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function setInitialGameState(color){
    
    userColor = color;
    castleMap = new Map();

    castleMap.set('e8c8', 'a8d8');
    castleMap.set('e8g8', 'h8f8');
    castleMap.set('e1c1', 'a1d1');
    castleMap.set('e1g1', 'h1f1');


    userPieceMap = new Map();


    // translateColumnMap = new Map(); 
    let pawnRow;
    let pieceRow;

    if(userColor === "w"){
        pawnRow = 2;
        pieceRow = 1;
    }

    if(userColor === "b"){
        pawnRow = 7;
        pieceRow = 8;
    }

    kingSideCastle = `e${pieceRow}g${pieceRow}`;
    queenSideCaslte = `e${pieceRow}c${pieceRow}`;

    const userPawn = userColor+'p';

    for(let i = 1; i<= 8; i++){

        
        
        // pawnArray[i] = columns[i] + pawnRow;
        // translateColumnMap.set(columns[i], i);

        userPieceMap.set(columns[i] + pawnRow, userPawn);
    }

    console.log("game state initialized.");
    console.log(board);

    userPieceMap.set('a' + pieceRow, userColor + 'R');
    userPieceMap.set('b' + pieceRow, userColor + 'N');
    userPieceMap.set('c' + pieceRow, userColor + 'B');
    userPieceMap.set('d' + pieceRow, userColor + 'Q');
    userPieceMap.set('e' + pieceRow, userColor + 'K');
    userPieceMap.set('f' + pieceRow, userColor + 'B');
    userPieceMap.set('g' + pieceRow, userColor + 'N');
    userPieceMap.set('h' + pieceRow, userColor + 'R');
}

/**
 * TODO: 
 */
function updateGameState(updatedMoveList){

    //either first move, or catching up to an ongoing game's current position.
    if(movesList.length == 0){
        
        //go through the entire moves list
        // let indexableMovesList = translateMoveList(updatedMoveList);
        // for(move of indexableMovesList)
        //     movePiece(move);
        for(move of updatedMoveList)
            movePiece(move);
    }

    else if(updatedMoveList.length - movesList.length == 1){

        //make sure our lists are consistent up to the point of the last known move; if not, a takeback has occured and shits gotta change
        if(isMovesListValid(updatedMoveList) == false)
            throw 'New moves list inconsistent with current moves; a take-back has likely occured. refresh page to correct board state.';
        
        else {
            
            const newMove = updatedMoveList[updatedMoveList.length - 1];
            movePiece(newMove);
        }
        
    }

    else throw 'new list of moves has either more or less than 1 new additional move; board state is likely corrupt. Refresh page to correct board state.';
    
    movesList = updatedMoveList;

    console.log(board);

}

function movePiece(move){

    const startingSquare = move.slice(0, 2);
    const destinationSquare = move.slice(2, 4);

    let movingPiece = board[startingSquare[0]][startingSquare[1]].toString();
    // const pieceColor = movingPiece.charAt(0);
    const destPiece = board[destinationSquare[0]][destinationSquare[1]];

    if (movingPiece === '--'){
        throw error('there is no piece on the starting square; you done fucked up now');
    }

    //check if piece is promoting; this move will always be from the Board API response, format should be consistent
    if(move.length == 5){
        movingPiece = movingPiece[0] + move[4].toUpperCase();
        if (movingPiece.includes(userColor)){
            promoteUserPawn(startingSquare, movingPiece);

        }

        console.log(movingPiece + ' was created on the board via promotion.');
    }

    if (destPiece.includes(userColor))
        deleteUserPiece(destinationSquare);
    

    if (movingPiece.includes(userColor))
        updateUserPiece(startingSquare, destinationSquare);
    
    board[destinationSquare[0]][destinationSquare[1]] = movingPiece;
    board[startingSquare[0]][startingSquare[1]] = '--';

    //CASTLE REVISED 
    if(castleMap.has(move) && movingPiece.includes('K')){
        movePiece(castleMap.get(move));
    }
    
}

// function translateMoveList(moveList){

//     let newList = [];
    
//     for(const move of moveList){
        
//         newList.push(translateMove(move));
//     }

//     return newList;
// }

// function translateMove(move){

//     let translatedMove = '--';

//     for(const c of move){
//         if (c.match(/[a-h]/)) translatedMove+= translateColumnMap.get(c);
//         else translatedMove+= c;
//     }

//     return translatedMove;
// }

function isMovesListValid(updatedMoveList){

    for(let i = 0; i< movesList.length; i++){

        if(updatedMoveList[i] !== movesList[i]) return false;
    }

    return true;
}

function deleteUserPiece(capturedPieceSquare){
    
    if(userPieceMap.delete(capturedPieceSquare))
        console.log('successfully removed piece from users piece list.');
    
    else throw 'attempted to delete piece that did not exist in users piece list??';


}

function promoteUserPawn(startingSquare, newPiece){
    
    if (userPieceMap.get(startingSquare) == undefined){
        throw'promoteUserPawn: attempting to promote pawn that does not exist in userPieceMap!';
    }

    // newPiece = newPiece[0] + newPiece[1];
    userPieceMap.set(startingSquare, newPiece);

    console.log('promoteUserPawn: success');
}

function updateUserPiece(previousSquare, newSquare){

    const piece = userPieceMap.get(previousSquare);

    if(piece == undefined){
        console.log(board);
        throw 'updateUserPiece: attempting to update piece that does not exist in userPieceMap!';
    }
    
    userPieceMap.delete(previousSquare);
    userPieceMap.set(newSquare, piece);

    console.log('updateUserPiece: success');
}

//TODO: currently assuming any non UCI format input is SAN; may be problematic later
function getUCIFromSAN(sanMove){

    console.log('converting...');
    sanMove = removeCaptureNotation(sanMove);
    //attempt to parse a SAN format move into a UCI format move
    if(/[a-h]/.test(sanMove.charAt(0))) return getPawnMove(sanMove);

    if(/[QRBNK]/.test(sanMove.charAt(0))) return getPieceMove(sanMove);

    if(sanMove === '0-0' || sanMove === '0-0-0') return getCastleMove(sanMove);

}

function getPieceMove(sanMove){

    let translatedMove = '';
    const piece = sanMove[0];
    let pieceList = getPieceList(piece);

    if(pieceList == -1)
        throw 'panik';
    
    let moveComponents = getPieceMoveComponents(sanMove);

    if(pieceList.length == 1)
        translatedMove = pieceList[0] + moveComponents.destination;
    
    else translatedMove = findValidPiece(pieceList, moveComponents) + moveComponents.destination;
    
    return translatedMove;
}

function getPawnMove(sanMove){

    console.log('getPawnMove: ' + sanMove);
    sanMove = sanMove.replace('=', '');

    let destination = sanMove.match(/[a-h][1-8]/);

    if(destination == null)
        throw INVALID_MOVE;
    else destination = destination[0];
    
    console.log('destination: ' + destination);
    if(destination === '')
        throw 'Failed to find destination square for pawn move.'
    
    
    const col = destination[0];
    const destRow = parseInt(destination[1]);

    let direction = 0;
    if(userColor === 'b')
        direction = -1;
    
    if(userColor === 'w')
        direction = 1;

    
    if(sanMove.length == 2){
        //if move to rank 4 for white or rank 5 for black, check pawn map
        //else assume pawn's position
    
        if((destRow == 5 && userColor == 'b') || (destRow == 4 && userColor == 'w')){ 
            if(board[col][destRow - direction] !== (userColor + 'p'))
                return col + (destRow - (direction * 2)) + destination;
            
        }
        return  col + (destRow - direction) + destination;
    }

    if (sanMove.length == 3){

        //capturing
        if(/[a-h][a-h][1-8]/.test(sanMove))
            return sanMove[0] + (destRow - direction) + destination;
        
        if(/[a-h][1-8][QRBN]/.test(sanMove))
            return col + (destRow - direction) + destination + sanMove[sanMove.length - 1];
    }

    if(sanMove.length == 4)
        if(/[a-h][a-h][1-8][QRBN]/.test(sanMove))
            return sanMove[0] + (destRow - direction) + destination + sanMove[sanMove.length - 1];
    
    return -1;

}

function getCastleMove(sanMove){
    
    if(sanMove === '0-0') return kingSideCastle;
    if(sanMove === '0-0-0') return queenSideCastle;
    return -1;
}

function getPieceList(piece){

    const userPiece = userColor + piece.toUpperCase();
    let pieceList = [];

    //do we need to get the tuple of key and value or just the value? Value might be more simple?
    for(entry of userPieceMap.entries()){
        if (entry[1] == userPiece)
            pieceList.push(entry[0]); //pushing just the key 
    }
    
    if(pieceList.length == 0)
        return -1;
    
    return pieceList;
}

function getPieceMoveComponents(sanMove){
    
    const moveLength = sanMove.length;
    let moveComponents = {};
    moveComponents.piece = sanMove[0];

    moveComponents.squareInfo = sanMove.substr(1, moveLength - 3);
    moveComponents.destination = sanMove.substr(moveLength - 2, 2);

    return moveComponents;
}

//called if pieceList is longer than 1
//TODO: if we do not need to check for pins, there may be no need to store squares in arrays; consider changing at some point
function findValidPiece(pieceList, moveComponents){

    //piece list has a list of keys (squares) from map
    //moveComponents has piece, squareInfo, destination
    let validPieces = [];
    
    //first, check if identifying info successfully narrows it down to a single piece
    if(moveComponents.squareInfo !== ''){
        

        for (square of pieceList){
            if(square.includes(moveComponents.squareInfo)){
                validPieces.push(square);
            }
        }
    
        if(validPieces.length == 0){
            console.log('no valid squares found, probably throw error for user');
            return -1;
        }
        
        else if (validPieces.length == 1)
            return validPieces[0];
        
        else {
            console.log('squareInfo allows for more than 1 piece, throw error for user');
            return -1;
        }
    }

    //no starting square info; now checking which pieces are in range of the target square
    //must ALSO check for blocking
    for(square of pieceList){
        if (pieceHasAccess(square, moveComponents.destination, moveComponents.piece)){
            validPieces.push(square);
            //add to valid squares
        }
    }

    if(validPieces.length == 0)
    console.log('None of the valid pieces found are in range of the destination square, probably throw error');

    else if (validPieces.length == 1)
        return validPieces[0];
    
    else console.log('More than 1 piece has access to this square; user must specify the correct piece!');
    
    return -1;

}

//TODO: Handle if destination square is piece belonging to user?? prob not
function pieceHasAccess(start, dest, piece){
    coordinates = getNumericCoordinates(start, dest);
    if(piece.match('N'))
        return inKnightRange(coordinates);

    else if((sharesColumn(coordinates) || sharesRow(coordinates)) && piece.match(/[QR]/) && !isBlocked(coordinates)){

        //if not blocked
        //involves checking squares between starting and ending squares in the board object
        return true;
    }
    else if(sharesDiagonal(coordinates) && piece.match(/[QB]/) && !isBlocked(coordinates)){

        //if not blocked
        return true;
    }
    
    return false;
}

function inKnightRange(coordinates){
    
    let diffCol = Math.abs(coordinates.startCol - coordinates.destCol);
    let diffRow = Math.abs(coordinates.startRow - coordinates.destRow);

    if(Math.abs(diffCol - diffRow) == 1){
        console.log('knight is in range');
        return true;
    }
    console.log('knight NOT in range');
    return false;
}

function sharesColumn(coordinates){
    return coordinates.startCol == coordinates.destCol;
}

function sharesRow(coordinates){
    return coordinates.startRow == coordinates.destRow;
}

function sharesDiagonal(coordinates){
    return (Math.abs(coordinates.startCol - coordinates.destCol) == Math.abs(coordinates.startRow - coordinates.destRow));
}

function getNumericCoordinates(start, dest){
    return {
        startCol: columns.indexOf(start[0]),
        startRow: parseInt(start[1]),
        destCol: columns.indexOf(dest[0]),
        destRow: parseInt(dest[1])
    }
}

function isBlocked(coordinates){
    //TODO: We are successfully (it seems) checking the squares leading up to the destination square. 


    let rowDir, colDir;
    //squares are on the same column
    if(coordinates.startCol - coordinates.destCol == 0){
        colDir = 0;
        coordinates.startRow > coordinates.destRow ? rowDir = -1: rowDir = 1;

        console.log('move is down column');

    }

    //squares are on the same row
    else if(coordinates.startRow - coordinates.destRow == 0){
        rowDir = 0;
        coordinates.startCol > coordinates.destCol ? colDir = -1: colDir = 1;
        console.log('move is down row');

        
    }
    //squares are on the same diagonal
    else if((Math.abs(coordinates.startCol - coordinates.destCol) == Math.abs(coordinates.startRow - coordinates.destRow))){

        
        coordinates.startCol > coordinates.destCol ? colDir = -1: colDir = 1;
        coordinates.startRow > coordinates.destRow ? rowDir = -1: rowDir = 1;
        console.log('move is down diagonal');

        
    }

    else {
        throw 'error: squares are not on same row, column, or diagonal';
    }

    let checkRow = coordinates.startRow + rowDir;
    let checkCol = coordinates.startCol + colDir;

    
    while(!(coordinates.destRow == checkRow && coordinates.destCol == checkCol)){
        console.log('checking ' + columns[checkCol] + checkRow);
        //if square is occupied
        if(board[columns[checkCol]][checkRow] !== '--'){
            console.log('piece is blocked; does not have line of sight to destination square!');
            return true;

        }
        
        checkRow += rowDir;
        checkCol += colDir;
    }

    //if squares have line of sight of each other
    return false;
}

function removeCaptureNotation(sanMove){
    return sanMove.replace('x', '');
}