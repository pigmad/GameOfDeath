class species {
    constructor(actionsArray, alive, color) {
        this.actionsArray = actionsArray;
        this.alive = alive;
        this.color = color;
    }
    
    get actionsArray(){
        return this.actionsArray;
    }
    
    get alive(){
        return this.alive;
    }
    
    get color(){
        return this.color;
    }
}

class world{
    constructor(speciesArray, maxSpecies, pMut) {
        this.speciesArray = speciesArray;
        this.maxSpecies = maxSpecies; 
        this.pMut = pMut; 
        var cvs = document.getElementById("canvas");
        this.xMax = cvs.width;
        this.yMax = cvs.height;
        this.board = new Array(this.xmax%20);
        for (var i = 0; i < this.xmax%20; i++) {
            this.board[i] = new Array(3);
        }
    }
    
}
