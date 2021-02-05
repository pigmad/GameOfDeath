class Species {
    constructor(actionsArray, alive, color) {
        this.actionsArray = actionsArray;
        this.alive = alive;
        this.color = color;
    }

    static getSituation(selectedSpecies, x, y, board) {
        var neigh = [];
        neigh.push(encodeSitutation(selectedSpecies, board[(x - 1) % board.xMax][y]));
        neigh.push(encodeSitutation(selectedSpecies, board[(x + 1) % board.xMax][y]));
        neigh.push(encodeSitutation(selectedSpecies, board[x][(y - 1) % board.yMax]));
        neigh.push(encodeSitutation(selectedSpecies, board[x][(y + 1) % board.yMax]));

        return 1 + neigh[0] + 3 * neigh[1] + 9 * neigh[2] + 27 * neigh[3];
    }

    static encodeSituation(selectedSpecies, cellValue) {
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
}

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

function initSpecies() {
    species = [];
    for (var i = 0; i < SPECIESNUMBER; i++) {
        //génération du génotype de l'espèce
        actionArray = [];
        for (var j = 0; j < MAXSITUATIONS; j++) {
            actionArray.push(1 + Math.floor(Math.random() * ACTIONSNUMBER));
        }
        //génération de la couleur de la cellule
        color = [1 + Math.floor(Math.random() * 255), 1 + Math.floor(Math.random() * 255), 1 + Math.floor(Math.random() * 255)];
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
    var pMut = 0.5;
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

initWorld();
console.log(world);