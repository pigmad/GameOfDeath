//nombre maximum d'espèces dans le monde
SPECIESNUMBER = 3;
//nombre de situtation perçue par une cellule en fonction de son voisinage 
//4 cellules voisines aux cardinaux (N,S,E,O) * 3 valeur de cellules possible (0 = rien, 1 = même espèce, 2 = espèce différente)
// = 3^4 = 81)
MAXSITUATIONS = 81;
//nombre maximum d'actions qu'une cellule peut faire, les codes associés sont définis ci-dessous
ACTIONSNUMBER = 5;

//CELLS ACTION CODES
NOPE = 1; //rien
NORTH = 2; //créer une cellule au nord
SOUTH = 3; //créer une cellule au sud
WEST = 4; //créer une cellule à l'ouest
EAST = 5; //créer une cellule à l'est

//USER ACTION CODES
BOMB = -3;
FIRE = -4;
ICE = -5;
BAIT = -6;

class Player {
    constructor(energy, actionBoard) {
        this.energy = energy;
        this.actionBoard = actionBoard;
    }
}

class Species {
    constructor(actionsArray, alive, color) {
        this.actionsArray = actionsArray;
        this.alive = alive;
        this.color = color;
    }

    mutateGenome() {
        var mutatedGenome = JSON.parse(JSON.stringify(this.actionsArray));
        var mutationNumber = 2 + Math.floor(Math.random() * MAXSITUATIONS);
        for (var i = 0; i < mutationNumber; i++) {
            var mutatedGene = Math.floor(Math.random() * MAXSITUATIONS);
            mutatedGenome[mutatedGene] = 1 + Math.floor(Math.random() * MAXSITUATIONS);
        }
        return mutatedGenome;
    }

    mutateColor() {
        var mutatedColor = [];
        for (var i = 0; i < 3; i++) {
            var color = Math.abs((this.color[i] - 20 + Math.floor(Math.random() * 120)) % 255);
            mutatedColor.push(color);
        }
        return mutatedColor;
    }
}

class World {
    constructor(xMax, yMax, board, cycle, speciesArray, maxSpecies, pMut, player) {
        this.xMax = xMax;
        this.yMax = yMax;
        this.board = board;
        this.cycle = cycle;
        this.speciesArray = speciesArray;
        this.maxSpecies = maxSpecies;
        this.pMut = pMut;
        this.player = player;
    }

    getSituation(selectedSpecies, x, y, board) {
        function encodeSituation(selectedSpecies, cellValue) {
            if (cellValue === -1) {
                return 0;
            } else {
                if (selectedSpecies !== cellValue) {
                    return 2;
                } else {
                    return 1;
                }
            }
        }

        var neigh = [];
        neigh.push(encodeSituation(selectedSpecies, board[(x - 1 + world.xMax) % world.xMax][y]));
        neigh.push(encodeSituation(selectedSpecies, board[(x + 1) % world.xMax][y]));
        neigh.push(encodeSituation(selectedSpecies, board[x][(y - 1 + world.yMax) % world.yMax]));
        neigh.push(encodeSituation(selectedSpecies, board[x][(y + 1) % world.yMax]));
        return 1 + neigh[0] + 3 * neigh[1] + 9 * neigh[2] + 27 * neigh[3];
    }

    cellActionNoMut(x, y, cellValue, board) {
        if (board[x][y] !== -1 && board[x][y] !== cellValue) {
            board[x][y] = -2;
        } else {
            board[x][y] = cellValue;
            world.player.energy++;
            console.log(world.player.energy);
        }
    }

    cellActionMut(x, y, cellValue, board) {
        if (board[x][y] !== -1 && board[x][y] !== cellValue) {
            board[x][y] = -2;
        } else {
            if (Math.random() > this.pMut) {
                board[x][y] = cellValue;
                world.player.energy++;
                console.log(world.player.energy);
            } else {
                var species = world.speciesArray[cellValue];
                var mutatedActionArray = species.mutateGenome();
                var mutatedColor = species.mutateColor();
                var mutatedCell = new Species(mutatedActionArray, true, mutatedColor);
                this.speciesArray.push(mutatedCell);
                board[x][y] = this.speciesArray.length - 1;
                board[(x - 1 + world.xMax) % world.xMax][y] = this.speciesArray.length - 1;
                board[(x + 1) % world.xMax][y] = this.speciesArray.length - 1;
                board[x][(y - 1 + world.yMax) % world.yMax] = this.speciesArray.length - 1;
                board[x][(y + 1) % world.yMax] = this.speciesArray.length - 1;
                world.player.energy++;
                console.log(world.player.energy);
            }
        }
    }
}

function initSpecies() {
    var species = [];
    for (var i = 0; i < SPECIESNUMBER; i++) {
        //génération du génotype de l'espèce
        var actionArray = [];
        for (var j = 0; j < MAXSITUATIONS; j++) {
            actionArray.push(1 + Math.floor(Math.random() * ACTIONSNUMBER));
        }
        //génération de la couleur de la cellule
        var color = [1 + Math.floor(Math.random() * 255), 1 + Math.floor(Math.random() * 255), 1 + Math.floor(Math.random() * 255)];
        var s = new Species(actionArray, true, color);
        species.push(s);
    }
    return species;
}

function initPlayer(xMax, yMax) {
    var actionBoard = [];
    for (var x = 0; x < xMax; x++) {
        var line = [];
        for (var y = 0; y < yMax; y++) {
            line.push(0);
        }
        actionBoard.push(line);
    }
    return new Player(0, actionBoard);
}

function initWorld() {
    var xMax = cvs.width / STEP;
    var yMax = cvs.height / STEP;
    var board = [];
    var cycle = 0;
    var pMut = 0.0005;
    var pCreate = 0.05;
    var species = initSpecies();
    var player = initPlayer(xMax, yMax);
    for (var x = 0; x < xMax; x++) {
        var line = [];
        for (var y = 0; y < yMax; y++) {
            if (Math.random() < pCreate) {
                //la valeur d'une cellule 
                line.push(Math.floor(Math.random() * SPECIESNUMBER));
            } else {
                line.push(-1);
            }
        }
        board.push(line);
    }
    var world = new World(xMax, yMax, board, cycle, species, SPECIESNUMBER, pMut, player);
    drawWorld(world);
    setDropDownAliveSpecies(world);
    return world;
}

function worldStep() {
    world.cycle++;
    //création matrice vide
    var emptyBoard = [];
    for (var x = 0; x < world.xMax; x++) {
        var line = [];
        for (var y = 0; y < world.yMax; y++) {
            line.push(-1);
        }
        emptyBoard.push(line);
    }
    for (var x = 0; x < world.xMax; x++) {
        for (var y = 0; y < world.yMax; y++) {
            var cellValue = world.board[x][y];
            if (cellValue >= 0) {
                var situation = world.getSituation(cellValue, x, y, world.board);
                var action = world.speciesArray[cellValue].actionsArray[situation];
                switch (action) {
                    case NOPE :
                        world.cellActionNoMut(x, y, cellValue, emptyBoard);
                        break;
                    case NORTH :
                        world.cellActionMut(x, (y - 1 + world.yMax) % world.yMax, cellValue, emptyBoard);
                        world.cellActionMut(x, y, cellValue, emptyBoard);
                        break;
                    case SOUTH:
                        world.cellActionMut(x, (y + 1) % world.yMax, cellValue, emptyBoard);
                        world.cellActionMut(x, y, cellValue, emptyBoard);
                        break;
                    case WEST:
                        world.cellActionMut((x - 1 + world.xMax) % world.xMax, y, cellValue, emptyBoard);
                        world.cellActionMut(x, y, cellValue, emptyBoard);
                        break;
                    case EAST:
                        world.cellActionMut((x + 1) % world.xMax, y, cellValue, emptyBoard);
                        world.cellActionMut(x, y, cellValue, emptyBoard);
                        break;
                }
            }
        }
    }
    for (var x = 0; x < world.xMax; x++) {
        for (var y = 0; y < world.yMax; y++) {
            var cellValue = emptyBoard[x][y];
            if (cellValue === -2) {
                emptyBoard[x][y] = -1;
            }
        }
    }
    //world.board = JSON.parse(JSON.stringify(emptyBoard));
    world.board = emptyBoard;
    checkAliveSpecies();
    deleteDeadSpecies();
    drawWorld(world);
    setDropDownAliveSpecies(world);
}

function checkAliveSpecies() {
    for (var i = 0; i < world.speciesArray.length; i++) {
        world.speciesArray[i].alive = false;
    }
    for (var x = 0; x < world.xMax; x++) {
        for (var y = 0; y < world.yMax; y++) {
            var cellValue = world.board[x][y];
            if (cellValue >= 0) {
                world.speciesArray[cellValue].alive = true;
            }
        }
    }
}

function deleteDeadSpecies() {
    var speciesAlive = [];
    var boardCopy = JSON.parse(JSON.stringify(world.board));
    for (var i = 0; i < world.speciesArray.length; i++) {
        if (world.speciesArray[i].alive) {
            speciesAlive.push(world.speciesArray[i]);
        } else {
            for (var x = 0; x < world.xMax; x++) {
                for (var y = 0; y < world.yMax; y++) {
                    var cellValue = boardCopy[x][y];
                    if (cellValue === i) {
                        world.board[x][y] = -1;
                    } else if (cellValue > i) {
                        world.board[x][y]--;
                    }
                }
            }
        }
    }
    world.speciesArray = speciesAlive;
}

/* ***** MAIN ***** */

// boucle autoplay
autoplay = false;

//initialisation du plateau de jeu
world = initWorld();

function toggleAutoplay() {
    var button = document.getElementById("start");
    if (!autoplay) {
        button.value = "Stop";
        resetImagesBorder();
        autoplay = setInterval(worldStep, 200);
    } else {
        button.value = "Jouer";
        clearInterval(autoplay);
        autoplay = false;
    }
}