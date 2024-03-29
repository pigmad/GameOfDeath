//nombre maximum d'espèces dans le monde
SPECIESNUMBER = 3;
//nombre de situtation perçue par une cellule en fonction de son voisinage 
//4 cellules voisines aux cardinaux (N,S,E,O) * 3 valeur de cellules possible (0 = rien, 1 = même espèce, 2 = espèce différente)
// = 3^4 = 81)
MAXSITUATIONS = 81;
//nombre maximum d'actions qu'une cellule peut faire, les codes associés sont définis ci-dessous
ACTIONSNUMBER = 5;
//Nombre de cellules maximum avant fin de la partie
ENDGAME_CELL_NUMBER = 500000;

//CELLS ACTION CODES
NOPE = 1; //rien
NORTH = 2; //créer une cellule au nord
SOUTH = 3; //créer une cellule au sud
WEST = 4; //créer une cellule à l'ouest
EAST = 5; //créer une cellule à l'est

//USER ACTION CODES
BOMB = -3;
FIRE = -4;
FIRE2 = -41;
FIRE3 = -42;
FIRE4 = -43;
FIRE5 = -44;
ICE = -5;
BAIT = -6;

//énergie maximale
ENERGY_MAX = 500;
ENERGY_PER_CYCLE = 100;

//cout en énergie d'une bombe
BOMB_COST = 200;
FIRE_COST = 100;
ICE_COST = 200;
BAIT_COST = 200;

//classe représentant le joueur avec une jauge d'énergie et un tableau d'actions avec une bombe, du feu
class Player {
    constructor(energy, actionBoard) {
        this.energy = energy;
        this.actionBoard = actionBoard;
    }

    addEnergy(qty) {
        //si l'énergie du joueur est inférieure au maximum
        if (this.energy + qty <= ENERGY_MAX) {
            this.energy += qty;
            setEnergy();
        }
    }

    removeEnergy(qty) {
        if (this.energy - qty >= 0) {
            this.energy -= qty;
            setEnergy();
        }
    }
}

//classe représentant une espèce avec un tableau d'actions, un booléen pour savoir si elle est en vie et une couleur
class Species {
    constructor(actionsArray, alive, color) {
        this.actionsArray = actionsArray;
        this.alive = alive;
        this.color = color;
    }

    mutateGenome() {
        var mutatedGenome = JSON.parse(JSON.stringify(this.actionsArray));
        var mutationNumber = Math.floor(Math.random() * MAXSITUATIONS);
        for (var i = 0; i < mutationNumber; i++) {
            var mutatedGene = Math.floor(Math.random() * MAXSITUATIONS);
            mutatedGenome[mutatedGene] = 1 + Math.floor(Math.random() * ACTIONSNUMBER);
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

//classe représentant le monde avec sa taille, son tableau des espèces, le nombre d'espèces au maximum, la probabilité de mutation des cellules, le joueur
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

    //calcul de la situation de l'espèce cellValue aux coordonnées (x,y)
    getSituation(selectedSpecies, x, y, board) {
        function encodeSituation(selectedSpecies, cellValue) {
            //case vide
            if (cellValue === -1) {
                return 0;
            } else {
                // case occupée par une cellule d'une autre espèce
                if (selectedSpecies !== cellValue) {
                    return 2;
                }
                //case occupée par une cellule de la même espèce 
                else {
                    return 1;
                }
            }
        }

        var neigh = [];
        //calcul de la situation à l'ouest de la case considérée
        neigh.push(encodeSituation(selectedSpecies, board[(x - 1 + world.xMax) % world.xMax][y]));
        //calcul de la situation à l'est de la case considérée
        neigh.push(encodeSituation(selectedSpecies, board[(x + 1) % world.xMax][y]));
        //calcul de la situation au nord de la case considérée
        neigh.push(encodeSituation(selectedSpecies, board[x][(y - 1 + world.yMax) % world.yMax]));
        //calcul de la situation au sud de la case considérée
        neigh.push(encodeSituation(selectedSpecies, board[x][(y + 1) % world.yMax]));
        return neigh[0] + 3 * neigh[1] + 9 * neigh[2] + 27 * neigh[3];
    }

    //ajout d'une cellule cellValue aux coordonnées (x,y) sans mutation
    cellActionNoMut(x, y, cellValue, board) {
        //si la case est occupée par une cellule d'une autre espèce alors la cellule est détruite
        if (board[x][y] !== -1 && board[x][y] !== cellValue) {
            board[x][y] = -2;
        }
        //la cellule est créée aux coordonnées (x,y)
        else {
            //cas où il n'y a pas de feu
            if (world.player.actionBoard[x][y] != FIRE2 && world.player.actionBoard[x][y] != FIRE3 && world.player.actionBoard[x][y] != FIRE4 && world.player.actionBoard[x][y] != FIRE5)
            {
                board[x][y] = cellValue;
            }
        }
    }

    //ajout d'une cellule cellValue aux coordonnées (x,y) avec mutation
    cellActionMut(x, y, cellValue, board) {
        //s'il y a déjà une cellule d'une autre espèce alors la cellule est détruite
        if (board[x][y] !== -1 && board[x][y] !== cellValue) {
            board[x][y] = -2;
        } else {
            //cas où il n'y a pas de feu
            if (world.player.actionBoard[x][y] != FIRE2 && world.player.actionBoard[x][y] != FIRE3 && world.player.actionBoard[x][y] != FIRE4 && world.player.actionBoard[x][y] != FIRE5)
            {
                //cas où il n'y a pas de mutation
                if (Math.random() > this.pMut) {
                    document.getElementById("nbcellules").innerHTML = (parseInt(document.getElementById("nbcellules").innerHTML) + 1).toString();
                    board[x][y] = cellValue;
                }
                //cas où il y a une mutation
                else {
                    var species = world.speciesArray[cellValue];
                    //calcul du tableau des actions de l'espèce mutée
                    var mutatedActionArray = species.mutateGenome();
                    //calcul de la couleur de l'espèce mutée
                    var mutatedColor = species.mutateColor();
                    var mutatedCell = new Species(mutatedActionArray, true, mutatedColor);
                    this.speciesArray.push(mutatedCell);
                    //création de cellules (ajout dans le tableau des cellules) de l'espèce mutée aux coordonnées (x,y) ainsi qu'aux 4 cases (nord, sud, est, ouest) adjacentes
                    document.getElementById("nbcellules").innerHTML = (parseInt(document.getElementById("nbcellules").innerHTML) + 1).toString();
                    board[x][y] = this.speciesArray.length - 1;
                    board[(x - 1 + world.xMax) % world.xMax][y] = this.speciesArray.length - 1;
                    board[(x + 1) % world.xMax][y] = this.speciesArray.length - 1;
                    board[x][(y - 1 + world.yMax) % world.yMax] = this.speciesArray.length - 1;
                    board[x][(y + 1) % world.yMax] = this.speciesArray.length - 1;
                }
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
        var color = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
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
                document.getElementById("nbcellules").innerHTML = (parseInt(document.getElementById("nbcellules").innerHTML) + 1).toString();
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
    world.player.addEnergy(ENERGY_PER_CYCLE);
    // cas où le joueur perd
    if (document.getElementById("nbcellules").innerHTML > ENDGAME_CELL_NUMBER)
    {
        alert("Vous avez perdu");
        document.location.reload();
    }
    //cas où le joueur gagne
    if (world.speciesArray.length == 0)
    {
        alert("Vous avez gagné");
        document.location.reload();
    }

    //création matrice vide
    var emptyBoard = [];
    for (var x = 0; x < world.xMax; x++) {
        var line = [];
        for (var y = 0; y < world.yMax; y++) {
            line.push(-1);
        }
        emptyBoard.push(line);
    }

    // boucler sur le tableau du joueur pour faire effet des bombes puis init le plateau du joueur
    for (var x = 0; x < world.xMax; x++) {
        for (var y = 0; y < world.yMax; y++) {
            if (world.player.actionBoard[x][y] == BOMB) {
                //destruction de la cellule
                world.board[x][y] = -1;
            } else if (world.player.actionBoard[x][y] == FIRE)
            {
                //destruction de la cellule
                world.board[x][y] = -1;
            } else if (world.player.actionBoard[x][y] == FIRE2)
            {
                world.board[x][y] = -1;
            } else if (world.player.actionBoard[x][y] == FIRE3)
            {
                world.board[x][y] = -1;
            } else if (world.player.actionBoard[x][y] == FIRE4)
            {
                world.board[x][y] = -1;
            } else if (world.player.actionBoard[x][y] == FIRE5)
            {
                world.board[x][y] = -1;
            } else if (world.player.actionBoard[x][y] == ICE)
            {

            } else if (world.player.actionBoard[x][y] == BAIT)
            {

            }
        }
    }

    var actionBoard = [];
    for (var x = 0; x < world.player.actionBoard.length; x++)
    {
        var line = [];
        for (var y = 0; y < world.player.actionBoard[x].length; y++)
        {
            //cas où il y a un feu
            if (world.player.actionBoard[x][y] == FIRE)
            {
                line.push(FIRE2);
            } else if (world.player.actionBoard[x][y] == FIRE2)
            {
                line.push(FIRE3);
            } else if (world.player.actionBoard[x][y] == FIRE3)
            {
                line.push(FIRE4);
            } else if (world.player.actionBoard[x][y] == FIRE4)
            {
                line.push(FIRE5);
            } else
            {
                line.push(0);
            }
        }
        actionBoard.push(line);
    }
    world.player.actionBoard = actionBoard;


    for (var x = 0; x < world.xMax; x++) {
        for (var y = 0; y < world.yMax; y++) {
            var cellValue = world.board[x][y];
            if (cellValue >= 0) {
                //calcul de la situation de l'espèce cellValue aux coordonnées (x,y)
                var situation = world.getSituation(cellValue, x, y, world.board);
                var action = world.speciesArray[cellValue].actionsArray[situation];
                switch (action) {
                    //cas où la cellule ne fait rien
                    case NOPE :
                        world.cellActionNoMut(x, y, cellValue, emptyBoard);
                        break;
                        //cas où la cellule se multiplie vers le nord
                    case NORTH :
                        world.cellActionMut(x, (y - 1 + world.yMax) % world.yMax, cellValue, emptyBoard);
                        world.cellActionMut(x, y, cellValue, emptyBoard);
                        break;
                        //cas où la cellule se multiplie vers le sud
                    case SOUTH:
                        world.cellActionMut(x, (y + 1) % world.yMax, cellValue, emptyBoard);
                        world.cellActionMut(x, y, cellValue, emptyBoard);
                        break;
                        //cas où la cellule se multiplie vers l'ouest
                    case WEST:
                        world.cellActionMut((x - 1 + world.xMax) % world.xMax, y, cellValue, emptyBoard);
                        world.cellActionMut(x, y, cellValue, emptyBoard);
                        break;
                        //cas où la cellule se multiplie vers l'est
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
                document.getElementById("nbcellules").innerHTML = (parseInt(document.getElementById("nbcellules").innerHTML) - 2).toString();
            }
        }
    }

    world.board = emptyBoard;
    checkAliveSpecies();
    deleteDeadSpecies();
    drawWorld(world);
    setDropDownAliveSpecies(world);
}

//fonction qui met à jour les espèces en vie selon l'occupation des cases du plateau
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

//fonction qui supprime les espèces éteintes de la liste des espèces
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
//boucle autoplay
autoplay = false;

//initialisation du plateau de jeu
world = initWorld();

function toggleAutoplay() {
    var button = document.getElementById("start");
    if (!autoplay) {
        button.value = "Stop";
        resetImagesBorder();
        //appel de la fonction worldstep toutes les 400 milisecondes
        autoplay = setInterval(worldStep, 400);
    } else {
        button.value = "Jouer";
        clearInterval(autoplay);
        autoplay = false;
    }
}