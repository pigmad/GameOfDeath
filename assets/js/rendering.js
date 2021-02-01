function init() {
    window.onresize = init;
    var cvs = document.getElementById("canvas"),
    ctx = cvs.getContext("2d");
    cvs.width = cvs.offsetWidth - (cvs.offsetWidth % 20);
    cvs.height = cvs.offsetHeight - (cvs.offsetHeight % 20);
    drawGrid(ctx, cvs.width, cvs.height, 20);
}

function drawGrid(ctx, w, h, step) {
    ctx.beginPath();
    for (var x = step; x <= w - step; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
    }
    ctx.strokeStyle = 'rgb(0,0,0)';
    ctx.lineWidth = 1;
    for (var y = step; y <= h - step; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }
    ctx.stroke();
}

window.onload = init;


