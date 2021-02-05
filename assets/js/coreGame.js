//nombre maximum d'espèces dans le monde
SPECIESNUMBER = 3;
//nombre de situtation perÃ§ue par une cellule en fonction de son voisinage 
//4 cellules voisines aux cardinaux (N,S,E,O) * 3 valeur de cellules possible (0 = rien, 1 = mÃªme espèce, 2 = espèce différente)
// = 3^4 = 81)
MAXSITUATIONS = 81;
//nombre maximum d'actions qu'une cellule peut faire, les codes associés sont définis ci-dessous
ACTIONSNUMBER = 4;

//ACTION CODES
NORTH = 1 //créer une cellule au nord
SOUTH = 2 //créer une cellule au nord
WEST = 3 //créer une cellule au nord
EAST = 4 //créer une cellule au nord


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
            mutatedGene = 1 + Math.floor(Math.random() * MAXSITUATIONS);
            mutatedGenome[mutatedGene] = 1 + Math.floor(Math.random() * MAXSITUATIONS);
        }
        return mutatedGenome;
    }

    mutateColor() {
        var mutatedColor = [];
        for (var i = 0; i < 3; i++) {
            var color = Math.abs((this.color[i] - 20 + Math.floor(Math.random() * 40)) % 255);
            mutatedColor.push(color);
        }
        return mutatedColor;
    }

    static getSituation(selectedSpecies, x, y, board) {
        console.log(board);

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
        neigh.push(encodeSituation(selectedSpecies, board[(x - 1) % world.xMax][y]));
        neigh.push(encodeSituation(selectedSpecies, board[(x + 1) % world.xMax][y]));
        neigh.push(encodeSituation(selectedSpecies, board[x][(y - 1) % world.yMax]));
        neigh.push(encodeSituation(selectedSpecies, board[x][(y + 1) % world.yMax]));
        return 1 + neigh[0] + 3 * neigh[1] + 9 * neigh[2] + 27 * neigh[3];
    }
}

class World {
    constructor(xMax, yMax, board, cycle, speciesArray, maxSpecies, pMut) {
        this.xMax = xMax;
        this.yMax = yMax;
        this.board = board;
        this.cycle = cycle;
        this.speciesArray = speciesArray;
        this.maxSpecies = maxSpecies;
        this.pMut = pMut;
    }

    cellAction(x, y, cellValue) {
        if (Math.random() > this.pMut) {
            this.board[x][y] = cellValue;
        } else {
            var species = world.speciesArray[cellValue];
            var mutatedActionArray = species.mutateGenome;
            var mutatedColor = species.mutateColor;
            var mutatedCell = new Species(mutatedActionArray, true, mutatedColor);
            this.speciesArray.push(mutatedCell);
            this.board[x][y] = this.speciesArray.length - 1;
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

function initWorld() {
    var xMax = cvs.width / STEP;
    var yMax = cvs.height / STEP;
    var board = [];
    var cycle = 0;
    var pMut = 1;
    var pCreate = 0.05;
    var species = initSpecies();
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
    var world = new World(xMax, yMax, board, cycle, species, SPECIESNUMBER, pMut);
    drawWorld(world);
    window.world = world;

}

function worldStep() {
    world.cycle++;
    //copie par valeur du plateau de jeu qui sert de référence
    var boardCopy = JSON.parse(JSON.stringify(world.board));

    for (var x = 0; x < world.xMax; x++) {
        for (var y = 0; y < world.yMax; y++) {
            var cellValue = boardCopy[x][y];
            //console.log(cellValue);
            if (cellValue >= 0) {
                console.log(boardCopy);
                var situation = Species.getSituation(cellValue, x, y, boardCopy);
                var action = world.speciesArray[cellValue].actionsArray[situation];
                switch (action) {
                    case NORTH :
                        world.cellAction(x, (y - 1) % world.yMax, cellValue);
                        break;
                    case SOUTH:
                        world.cellAction(x, (y + 1) % world.yMax, cellValue);
                        break;
                    case WEST:
                        world.cellAction((x + 1) % world.xMax, y, cellValue);
                        break;
                    case EAST:
                        world.cellAction((x + 1) % world.xMax, y, cellValue);
                        break;
                }
            }
        }
    }
    checkAliveSpecies();
    drawWorld(world);
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

initWorld();
console.log(world);

//while (true) {
//    worldStep();
//}