let game = {
    canvas: document.getElementById("canvas"),
    menu: function() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.context = this.canvas.getContext("2d");
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = 'rgba(30, 178, 54, 0.9)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        omsim();
    }
};

game.menu();

function omsim() {
    const width = 100;
    const height = 100;
    const x = game.canvas.width / 2;
    const y = game.canvas.height / 2;
    game.context.setTransform(1, 0, 0, 1, x, y);
    game.context.rotate(80*Math.PI / 180);
    game.context.fillStyle = 'black';
    game.context.fillRect(-width/2, -height/2, width, height);
    game.context.fill();
    game.context.setTransform(1, 0, 0, 1, 0, 0);
}



function newPoints(cx, cy, vx, vy, rotation) {
    let dx = vx - cx;
    let dy = vy - cy;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let originalAngle = Math.atan2(dy, dx);

    let rX = cx + distance * Math.cos(originalAngle, rotation);
    let rY = cy + distance * Math.sin(originalAngle, rotation);

    return {x: rX, y: rY};
}

function getRotatedSquareCoords(object) {
    let centerX = object.x + (object.width / 2);
    let centerY = object.y + (object.height / 2);

    let topLeft = newPoints(centerX, centerY, object.x, object.y, object.rotation);
    let topRight = newPoints(centerX, centerY, object.x + object.width, object.y, object.rotation);
    let bottomLeft = newPoints(centerX, centerY, object.x, object.y + object.height, object.rotation);
    let bottomRight = newPoints(centerX, centerY, object.x + object.width, object.y + object.height, object.rotation);
    return {
        tl: topLeft,
        tr: topRight,
        bl: bottomLeft,
        br: bottomRight
    }
}

//Functional objects for the Seperate Axis Theorum (SAT)
//Single vertex
function xy(x,y){
    this.x = x;
    this.y = y;
};
//The polygon that is formed from vertices and edges.
function polygon(vertices, edges){
    this.vertex = vertices;
    this.edge = edges;
};

//The actual Seperate Axis Theorum function
function sat(polygonA, polygonB){
    var perpendicularLine = null;
    var dot = 0;
    var perpendicularStack = [];
    var amin = null;
    var amax = null;
    var bmin = null;
    var bmax = null;
    //Work out all perpendicular vectors on each edge for polygonA
    for(var i = 0; i < polygonA.edge.length; i++){
         perpendicularLine = new xy(-polygonA.edge[i].y,
                                     polygonA.edge[i].x);
         perpendicularStack.push(perpendicularLine);
    }
    //Work out all perpendicular vectors on each edge for polygonB
    for(var i = 0; i < polygonB.edge.length; i++){
         perpendicularLine = new xy(-polygonB.edge[i].y,
                                     polygonB.edge[i].x);
         perpendicularStack.push(perpendicularLine);
    }
    //Loop through each perpendicular vector for both polygons
    for(var i = 0; i < perpendicularStack.length; i++){
        //These dot products will return different values each time
         amin = null;
         amax = null;
         bmin = null;
         bmax = null;
         /*Work out all of the dot products for all of the vertices in PolygonA against the perpendicular vector
         that is currently being looped through*/
         for(var j = 0; j < polygonA.vertex.length; j++){
              dot = polygonA.vertex[j].x *
                    perpendicularStack[i].x +
                    polygonA.vertex[j].y *
                    perpendicularStack[i].y;
            //Then find the dot products with the highest and lowest values from polygonA.
              if(amax === null || dot > amax){
                   amax = dot;
              }
              if(amin === null || dot < amin){
                   amin = dot;
              }
         }
         /*Work out all of the dot products for all of the vertices in PolygonB against the perpendicular vector
         that is currently being looped through*/
         for(var j = 0; j < polygonB.vertex.length; j++){
              dot = polygonB.vertex[j].x *
                    perpendicularStack[i].x +
                    polygonB.vertex[j].y *
                    perpendicularStack[i].y;
            //Then find the dot products with the highest and lowest values from polygonB.
              if(bmax === null || dot > bmax){
                   bmax = dot;
              }
              if(bmin === null || dot < bmin){
                   bmin = dot;
              }
         }
         //If there is no gap between the dot products projection then we will continue onto evaluating the next perpendicular edge.
         if((amin < bmax && amin > bmin) ||
            (bmin < amax && bmin > amin)){
              continue;
         }
         //Otherwise, we know that there is no collision for definite.
         else {
              return false;
         }
    }
    /*If we have gotten this far. Where we have looped through all of the perpendicular edges and not a single one of there projections had
    a gap in them. Then we know that the 2 polygons are colliding for definite then.*/
    return true;
}

//Detect for a collision between the 2 rectangles
function detectRectangleCollision(thisRect, otherRect){
    //Get rotated coordinates for both rectangles
    let tRR = getRotatedSquareCoords(thisRect);
    let oRR = getRotatedSquareCoords(otherRect);
    //Vertices & Edges are listed in clockwise order. Starting from the top right
    let thisTankVertices = [
        new xy(tRR.tr.x, tRR.tr.y),
        new xy(tRR.br.x, tRR.br.y),
        new xy(tRR.bl.x, tRR.bl.y),
        new xy(tRR.tl.x, tRR.tl.y),
    ];
    let thisTankEdges = [
        new xy(tRR.br.x - tRR.tr.x, tRR.br.y - tRR.tr.y),
        new xy(tRR.bl.x - tRR.br.x, tRR.bl.y - tRR.br.y),
        new xy(tRR.tl.x - tRR.bl.x, tRR.tl.y - tRR.bl.y),
        new xy(tRR.tr.x - tRR.tl.x, tRR.tr.y - tRR.tl.y)
    ];
    let otherTankVertices = [
        new xy(oRR.tr.x, oRR.tr.y),
        new xy(oRR.br.x, oRR.br.y),
        new xy(oRR.bl.x, oRR.bl.y),
        new xy(oRR.tl.x, oRR.tl.y),
    ];
    let otherTankEdges = [
        new xy(oRR.br.x - oRR.tr.x, oRR.br.y - oRR.tr.y),
        new xy(oRR.bl.x - oRR.br.x, oRR.bl.y - oRR.br.y),
        new xy(oRR.tl.x - oRR.bl.x, oRR.tl.y - oRR.bl.y),
        new xy(oRR.tr.x - oRR.tl.x, oRR.tr.y - oRR.tl.y)
    ];
    let thisRectPolygon = new polygon(thisTankVertices, thisTankEdges);
    let otherRectPolygon = new polygon(otherTankVertices, otherTankEdges);

    if(sat(thisRectPolygon, otherRectPolygon)){
        console.log('collide');
        return true;
    }else{
        thisRect.color = "black";
        //Because we are working with vertices and edges. This algorithm does not cover the normal un-rotated rectangle
        //algorithm which just deals with sides
        if(thisRect.currRotation === 0 && otherRect.currRotation === 0){
            if(!(
                thisRect.x>otherRect.x+otherRect.width || 
                thisRect.x+thisRect.width<otherRect.x || 
                thisRect.y>otherRect.y+otherRect.height || 
                thisRect.y+thisRect.height<otherRect.y
            )){
                thisRect.color = "red";
            }
        }
    }
}