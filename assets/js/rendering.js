function init() {
    window.cvs = document.getElementById("canvas");
    window.ctx = cvs.getContext("2d");
    window.STEP = 20;
    window.selectedImageCode = 0;
    cvs.addEventListener('mousemove', function (evt) {
        drawHoverImage(evt);
    });
    cvs.addEventListener('click', function (evt) {
        addUserAction(evt);
    });
    //window.onresize = resizeCanvas(cvs);
    resizeCanvas();
    drawGrid();
}

function resizeCanvas() {
    cvs.width = cvs.offsetWidth - (cvs.offsetWidth % STEP);
    cvs.height = cvs.offsetHeight - (cvs.offsetHeight % STEP);
}

function getMousePosition(evt) {
    var rect = cvs.getBoundingClientRect(),
            scaleX = cvs.width / rect.width,
            scaleY = cvs.height / rect.height;
    var x = (evt.clientX - rect.left) * scaleX,
            y = (evt.clientY - rect.top) * scaleY;
    return {
        xCell: Math.floor(x / STEP),
        yCell: Math.floor(y / STEP)
    };
}

function drawHoverImage(evt){
    drawUserActions();
    if (selectedImageCode) {
        var mousePos = getMousePosition(evt);
        var image = new Image();
        image.src = getSelectedImageSrc(window.selectedImageCode);
        ctx.drawImage(image, mousePos.xCell * STEP, mousePos.yCell * STEP, STEP, STEP);
    }
}

function addUserAction(evt) {
    if (selectedImageCode) {
        var mousePos = getMousePosition(evt);
        if (world.player.actionBoard[mousePos.xCell][mousePos.yCell] === selectedImageCode) {
            console.log("reset");
            world.player.actionBoard[mousePos.xCell][mousePos.yCell] = 0;
        } else {
            console.log("set " + selectedImageCode);
            world.player.actionBoard[mousePos.xCell][mousePos.yCell] = selectedImageCode;
        }
        drawUserActions();
    }
}

function drawUserActions() {
    drawWorld(world);
    for (var x = 0; x < world.xMax; x++) {
        for (var y = 0; y < world.yMax; y++) {
            var image = new Image();
            image.src = getSelectedImageSrc(world.player.actionBoard[x][y]);
            ctx.drawImage(image, x * STEP, y * STEP, STEP, STEP);
        }
    }
}

function drawGrid() {
    ctx.beginPath();
    var w = cvs.width;
    var h = cvs.height;
    ctx.strokeStyle = 'rgb(0,0,0)';
    ctx.lineWidth = 1;
    for (var x = STEP; x <= w - STEP; x += STEP) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
    }
    for (var y = STEP; y <= h - STEP; y += STEP) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }
    ctx.stroke();
}

function drawWorld(world) {
    drawGrid();
    for (var x = 0; x < world.xMax; x++) {
        for (var y = 0; y < world.yMax; y++) {
            var cellValue = world.board[x][y];
            if (cellValue === -1) {
                ctx.fillStyle = 'white';
                ctx.fillRect(x * STEP + 1, y * STEP + 1, STEP - 2, STEP - 2);
            } else {
                var color = world.speciesArray[cellValue].color;
                ctx.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
                ctx.fillRect(x * STEP + 1, y * STEP + 1, STEP - 2, STEP - 2);
            }
        }
    }
}

function setDropDownAliveSpecies(world) {
    var dropdown = document.getElementById("dropdownSpecies");
    //resetContent
    dropdown.innerHTML = "";
    for (var i = 0; i < world.speciesArray.length; i++) {
        var color = world.speciesArray[i].color;
        var colorString = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
        var item = "<li><a class='dropdown-item'>Espèce " + (i + 1) + "<div class='color-square' style='background-color:" + colorString + "'></div>" + "</a></li>";
        dropdown.innerHTML += item;
    }
}

function resetBorder(image) {
    image.style.border = "";
    image.style.borderRadius = "";
}

function resetImagesBorder() {
    resetBorder(document.getElementById("baitImage"));
    resetBorder(document.getElementById("iceImage"));
    resetBorder(document.getElementById("fireImage"));
    resetBorder(document.getElementById("bombImage"));
    window.selectedImageCode = 0;
}

function selectImage(selectedImage) {
    resetImagesBorder();
    selectedImage.style.border = "2px white solid";
    selectedImage.style.borderRadius = "4px";
    window.selectedImageCode = getSelectedImageCode(selectedImage);
    if (autoplay) {
        toggleAutoplay();
    }
}

function getSelectedImageCode(selectedImage) {
    if (selectedImage.src.includes("bomb")) {
        return BOMB;
    }
    if (selectedImage.src.includes("fire")) {
        return FIRE;
    }
    if (selectedImage.src.includes("ice")) {
        return ICE;
    }
    if (selectedImage.src.includes("bait")) {
        return BAIT;
    }
    return 0;
}

function getSelectedImageSrc(selectedImageCode) {
    if (selectedImageCode === BOMB) {
        return "assets/img/bomb-48.png";
    }
    if (selectedImageCode === FIRE) {
        return "assets/img/fire-48.png";
    }
    if (selectedImageCode === ICE) {
        return "assets/img/ice-48.png";
    }
    if (selectedImageCode === BAIT) {
        return "assets/img/bait-48.png";
    }
    return "";
}

/* ***** MAIN ***** */

//initialisation de la grille de jeu au chargement de la page
init();