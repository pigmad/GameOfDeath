function init() {
    window.cvs = document.getElementById("canvas");
    window.ctx = cvs.getContext("2d");
    window.STEP = 15;
    //window.onresize = resizeCanvas(cvs);
    resizeCanvas();
    drawGrid();
}

function resizeCanvas() {
    cvs.width = cvs.offsetWidth - (cvs.offsetWidth % STEP);
    cvs.height = cvs.offsetHeight - (cvs.offsetHeight % STEP);
}

function drawGrid() {
    ctx.beginPath();
    var w = cvs.width;
    var h = cvs.height;
    for (var x = STEP; x <= w - STEP; x += STEP) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
    }
    ctx.strokeStyle = 'rgb(0,0,0)';
    ctx.lineWidth = 1;
    for (var y = STEP; y <= h - STEP; y += STEP) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }
    ctx.stroke();
}

function drawWorld(world) {
    drawGrid();
    for (var i = 0; i < world.xMax; i++) {
        for (var j = 0; j < world.yMax; j++) {
            var cellValue = world.board[i][j];
            if (cellValue !== -1) {
                var color = world.speciesArray[cellValue].color;
                ctx.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
                ctx.fillRect(i * STEP + 1, j * STEP + 1, STEP - 2, STEP - 2);
            }
        }
    }
}

//initialisation de la grille de jeu au chargement de la page
init();


