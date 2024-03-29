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
    //window.onresize = resizeCanvas;
    resizeCanvas();
    drawGrid();
}

function resizeCanvas() {
    cvs.width = cvs.offsetWidth - (cvs.offsetWidth % STEP);
    cvs.height = cvs.offsetHeight - (cvs.offsetHeight % STEP);
}

//fonction qui retourne les coordonnées de la case de la position de la souris de l'utilisateur sur le plateau
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

//fonction qui affiche un objet sur le plateau en fonction de la position de la souris de l'utilisateur
function drawHoverImage(evt) {
    drawWorld(world);
    // si un objet (bombe, feu, ...) est sélectionné
    if (selectedImageCode) {
        //position de la souris de l'utilisateur sur le plateau
        var mousePos = getMousePosition(evt);
        var image = new Image();
        image.src = getSelectedImageSrc(window.selectedImageCode);
        if (selectedImageCode == BOMB)
        {
            //bombe de rayon 10*10
            for (var x = 0; x < 10; x++)
            {
                for (var y = 0; y < 10; y++)
                {
                    ctx.drawImage(image, ((mousePos.xCell + x - 4) * STEP + cvs.width) % cvs.width, ((mousePos.yCell + y - 4) * STEP + cvs.height) % cvs.height, STEP, STEP);
                }
            }

        } else if (selectedImageCode == FIRE)
        {
            //feu sur 10 cases verticalement
            for (var y = 0; y < world.yMax; y++)
            {
                ctx.drawImage(image, mousePos.xCell * STEP, ((mousePos.yCell + y - 4) * STEP + cvs.height) % cvs.height, STEP, STEP);
            }
        } else if (selectedImageCode == ICE)
        {
            ctx.drawImage(image, mousePos.xCell * STEP, mousePos.yCell * STEP, STEP, STEP);
        } else if (selectedImageCode == BAIT)
        {
            ctx.drawImage(image, mousePos.xCell * STEP, mousePos.yCell * STEP, STEP, STEP);
        }
    }
}

function addUserAction(evt) {
    // si un objet (bombe, feu, ...) est sélectionné
    if (selectedImageCode) {
        var mousePos = getMousePosition(evt);
        //si l'utilisateur clique sur un objet qui est déjà sur le plateau alors il disparait
        if (world.player.actionBoard[mousePos.xCell][mousePos.yCell] === selectedImageCode && world.player.actionBoard[(mousePos.xCell + 1) % world.player.actionBoard.length][mousePos.yCell] == selectedImageCode && world.player.actionBoard[(mousePos.xCell - 1 + world.player.actionBoard.length) % world.player.actionBoard.length][mousePos.yCell] == selectedImageCode && world.player.actionBoard[mousePos.xCell][(mousePos.yCell + 1) % world.player.actionBoard[mousePos.xCell].length] == selectedImageCode && world.player.actionBoard[mousePos.xCell][(mousePos.yCell - 1 + world.player.actionBoard[mousePos.xCell].length) % world.player.actionBoard[mousePos.xCell].length] == selectedImageCode) {
            world.player.actionBoard[mousePos.xCell][mousePos.yCell] = 0;
            //augmentation de l'énergie: cas bombe
            if (selectedImageCode == BOMB)
            {
                //effacer les images de bombes du plateau
                world.player.actionBoard[(mousePos.xCell + 1) % world.player.actionBoard.length][mousePos.yCell] = 0;
                world.player.actionBoard[(mousePos.xCell - 1 + world.player.actionBoard.length) % world.player.actionBoard.length][mousePos.yCell] = 0;
                world.player.actionBoard[mousePos.xCell][(mousePos.yCell + 1) % world.player.actionBoard[mousePos.xCell].length] = 0;
                world.player.actionBoard[mousePos.xCell][(mousePos.yCell - 1 + world.player.actionBoard[mousePos.xCell].length) % world.player.actionBoard[mousePos.xCell].length] = 0;
                world.player.addEnergy(BOMB_COST);
            }
            //cas feu
            else if (selectedImageCode == FIRE)
            {
                world.player.addEnergy(FIRE_COST);
            }
            //cas glace
            else if (selectedImageCode == ICE)
            {
                world.player.addEnergy(ICE_COST);
            }
            //cas appat
            else if (selectedImageCode == BAIT)
            {
                world.player.addEnergy(BAIT_COST);
            }
        } else {
            //cas bombe
            if (selectedImageCode == BOMB)
            {
                //si l'énergie du joueur est suffisante pour poser une bombe
                if (world.player.energy >= BOMB_COST)
                {
                    //bombe de rayon 10*10
                    for (var x = 0; x < 10; x++)
                    {
                        for (var y = 0; y < 10; y++)
                        {
                            world.player.actionBoard[(mousePos.xCell + x - 4 + world.player.actionBoard.length) % world.player.actionBoard.length][(mousePos.yCell + y - 4 + world.player.actionBoard[mousePos.xCell].length) % world.player.actionBoard[mousePos.xCell].length] = selectedImageCode;
                        }
                    }
                    //baisse de l'énergie
                    world.player.removeEnergy(BOMB_COST);
                }
            }
            //cas feu
            if (selectedImageCode == FIRE)
            {
                //si l'énergie du joueur est suffisante pour poser un feu
                if (world.player.energy >= FIRE_COST)
                {
                    //feu sur 10 cases verticalement
                    for (var y = 0; y < world.yMax; y++)
                    {
                        world.player.actionBoard[mousePos.xCell][(mousePos.yCell + y - 4 + world.player.actionBoard[mousePos.xCell].length) % world.player.actionBoard[mousePos.xCell].length] = selectedImageCode;
                    }
                    //baisse de l'énergie
                    world.player.removeEnergy(FIRE_COST);
                }
            }
            //cas glace
            if (selectedImageCode == ICE)
            {
                //si l'énergie du joueur est suffisante pour poser une glace
                if (world.player.energy >= ICE_COST)
                {
                    world.player.actionBoard[mousePos.xCell][mousePos.yCell] = selectedImageCode;
                    //baisse de l'énergie
                    world.player.removeEnergy(ICE_COST);
                }
            }
            //cas appat
            if (selectedImageCode == BAIT)
            {
                //si l'énergie du joueur est suffisante pour poser un appat
                if (world.player.energy >= BAIT_COST)
                {
                    world.player.actionBoard[mousePos.xCell][mousePos.yCell] = selectedImageCode;
                    //baisse de l'énergie
                    world.player.removeEnergy(BAIT_COST);
                }
            }
        }
        drawWorld(world);
    }
}

function drawGrid() {
    ctx.beginPath();
    var w = cvs.width;
    var h = cvs.height;
    // couleur noire pour les lignes autour des carrés de la grille
    ctx.strokeStyle = 'rgb(50,50,50)';
    //largeur des lignes
    ctx.lineWidth = 1;
    //tracé des lignes verticales
    for (var x = 0; x <= w; x += STEP) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
    }
    //tracé des lignes horizontales
    for (var y = 0; y <= h; y += STEP) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }
    ctx.stroke();
}

function drawWorld(world) {
    //tracé de la grille
    drawGrid();
    for (var x = 0; x < world.xMax; x++) {
        for (var y = 0; y < world.yMax; y++) {
            var cellValue = world.board[x][y];
            var userActionValue = world.player.actionBoard[x][y];
            //si pas de cellule, colorer la case en blanc
            if (cellValue === -1) {
                ctx.fillStyle = 'white';
                ctx.fillRect(x * STEP + 1, y * STEP + 1, STEP - 2, STEP - 2);
            } else {
                var color = world.speciesArray[cellValue].color;
                ctx.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
                ctx.fillRect(x * STEP + 1, y * STEP + 1, STEP - 2, STEP - 2);
            }
            if (userActionValue !== 0) {
                var image = new Image();
                image.src = getSelectedImageSrc(userActionValue);
                ctx.drawImage(image, x * STEP, y * STEP, STEP, STEP);
            }
        }
    }
}

// fonction pour remplir la combobox des espèces en vie
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

//fonction qui affiche l'énergie du joueur dans la barre de navigation
function setEnergy() {
    document.getElementById("value").innerHTML = world.player.energy.toString();
    window.barre.setAttribute("aria-valuenow", world.player.energy.toString());
    window.barre.setAttribute("style", "width: " + (world.player.energy / window.barre.getAttribute("aria-valuemax")) * 100 + "%");
}

//fonction qui enlève les bordures d'une image
function resetBorder(image) {
    image.style.border = "";
    image.style.borderRadius = "";
}

//fonction qui enlève les bordures des images des objets
function resetImagesBorder() {
    resetBorder(document.getElementById("baitImage"));
    resetBorder(document.getElementById("iceImage"));
    resetBorder(document.getElementById("fireImage"));
    resetBorder(document.getElementById("bombImage"));
    window.selectedImageCode = 0;
}

//fonction qui efectue les actions sur les images des objets (bombe, feu, glace, appat) de la navbar
function selectImage(selectedImage) {
    var selectedImageCode = getSelectedImageCode(selectedImage);
    if (window.selectedImageCode == selectedImageCode) {
        resetImagesBorder();
    }
    //cas où l'utilisateur clique sur une image (cela ajoute un cadre autour)
    else {
        //cas où il clique sur une bombe
        if (selectedImageCode == BOMB)
        {
            // si son énergie est supérieure au cout de la bombe
            if (world.player.energy >= BOMB_COST)
            {
                resetImagesBorder();
                selectedImage.style.border = "2px white solid";
                selectedImage.style.borderRadius = "4px";
                window.selectedImageCode = selectedImageCode;

                if (autoplay) {
                    toggleAutoplay();
                }
            }
        } else if (selectedImageCode == FIRE)
        {
            // si son énergie est supérieure au cout du feu
            if (world.player.energy >= FIRE_COST)
            {
                resetImagesBorder();
                selectedImage.style.border = "2px white solid";
                selectedImage.style.borderRadius = "4px";
                window.selectedImageCode = selectedImageCode;

                if (autoplay) {
                    toggleAutoplay();
                }
            }
        } else if (selectedImageCode == ICE)
        {
            // si son énergie est supérieure au cout de la glace
            if (world.player.energy >= ICE_COST)
            {
                resetImagesBorder();
                selectedImage.style.border = "2px white solid";
                selectedImage.style.borderRadius = "4px";
                window.selectedImageCode = selectedImageCode;

                if (autoplay) {
                    toggleAutoplay();
                }
            }
        } else if (selectedImageCode == BAIT)
        {
            // si son énergie est supérieure au cout de l'appat
            if (world.player.energy >= BAIT_COST)
            {
                resetImagesBorder();
                selectedImage.style.border = "2px white solid";
                selectedImage.style.borderRadius = "4px";
                window.selectedImageCode = selectedImageCode;

                if (autoplay) {
                    toggleAutoplay();
                }
            }
        }

    }
}

//fonction qui retourne le code d'un objet en fonction du chemin de l'image
function getSelectedImageCode(selectedImage) {
    if (selectedImage.src.includes("bomb")) {
        return BOMB;
    }
    if (selectedImage.src.includes("fire-48")) {
        return FIRE;
    }
    if (selectedImage.src.includes("fire2-48")) {
        return FIRE2;
    }
    if (selectedImage.src.includes("fire3-48")) {
        return FIRE3;
    }
    if (selectedImage.src.includes("fire4-48")) {
        return FIRE4;
    }
    if (selectedImage.src.includes("fire5-48")) {
        return FIRE5;
    }
    if (selectedImage.src.includes("ice")) {
        return ICE;
    }
    if (selectedImage.src.includes("bait")) {
        return BAIT;
    }
    return 0;
}

//fonction qui renvoie le chemin de l'image en fonction du code
function getSelectedImageSrc(selectedImageCode) {
    if (selectedImageCode === BOMB) {
        return "assets/img/bomb-48.png";
    }
    if (selectedImageCode === FIRE) {
        return "assets/img/fire-48.png";
    }
    if (selectedImageCode === FIRE2) {
        return "assets/img/fire2-48.png";
    }
    if (selectedImageCode === FIRE3) {
        return "assets/img/fire3-48.png";
    }
    if (selectedImageCode === FIRE4) {
        return "assets/img/fire4-48.png";
    }
    if (selectedImageCode === FIRE5) {
        return "assets/img/fire5-48.png";
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