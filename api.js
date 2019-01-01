/**
 *
 * @param width - Canvas width
 * @param height - Canvas height
 * @param bgColor - Background color (HTML notation or hex)
 * @param update - The game code to be run on every update, should call Game.update();
 * @constructor
 */

var context;
var game;

function Game(width, height, bgColor, update){
    this.canvas = document.createElement('canvas');
    this.width = width;
    this.height = height;
    this.ud = update;
    this.camX = 0;
    this.camY = 0;
    this.camVX = 0;
    this.camVY = 0;
    this.start = function(){
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
        this.interval = setInterval(this.ud, 0);
        this.lastUpdate = getSystemTime();
        context = this.context;
    };
    this.clear = function(){
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.fillStyle = bgColor;
        this.context.fillRect(0, 0, this.width, this.height);
    };
    /**
     * Clears the screen with the background color
     * @returns {number} Cumulative time between updates (Used to calculate position from velocity)
     */
    this.update = function(){
        this.clear();
        var time = getSystemTime();
        // Cumulative time
        var cumTime = time - this.lastUpdate;
        this.lastUpdate = time;
        this.camX += this.camVX * (cumTime/1000);
        this.camY += this.camVY * (cumTime/1000);
        return cumTime;
    };
    game = this;
}

/**
 *
 * @param src - Image source file
 * @param x position
 * @param y position
 * @constructor
 */
function Sprite(src, x, y){
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.g = 0;
    this.tv = -1;
    this.visible = true;
    this.floor = 0;
    this.cor = -1;
    this.img = document.createElement("img");
    this.img.src = src;

    this.update = function(cumTime){
        var time = cumTime/1000;
        this.vy += this.g * time;
        this.x += this.vx * time;
        this.y += this.vy * time;
        if(this.cor !== -1){
            if(this.y + this.img.height >= this.floor){
                this.y = this.floor;
                this.vy *= -this.cor;
            }
        }
        if(this.visible){
            context.drawImage(this.img, this.x - game.camX, this.y - game.camY);
        }
    };
    /**
     *
     * @param floor - The maximum Y position for the object before bouncing
     * @param cor  - The coefficient of restitution (The ratio of initial velocity to post bounce velocity; should be from 0-1) -1 for no bounce physics
     */
    this.setCoefficientOfRestitution = function(floor, cor){
        this.floor = floor;
        this.cor = cor;
    }
}

/**
 *
 * @param shape - Either square or circle (for circle the width becomes the diameter and height is ignored
 * @param x position
 * @param y position
 * @param width
 * @param height
 * @param color - either hex or HTML color name (e.g. "red")
 * @constructor
 */
function Shape(shape, x, y, width, height, color){
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.g = 0;
    this.tv = -1;
    this.visible = true;
    this.floor = 0;
    this.cor = -1;
    this.shape = shape;
    this.width = width;
    this.height = height;
    this.color = color;
    this.inTween = false;
    this.tweenTime = 0;

    this.update = function(cumTime){
        var time = cumTime/1000;
        this.vy += this.g * time;
        this.x += this.vx * time;
        this.y += this.vy * time;
        if(this.cor !== -1){
            if(this.y + this.height >= this.floor){
                this.y = this.floor - this.height;
                this.vy *= -this.cor;
            }
        }

        if(this.inTween){
            this.tweenTime += cumTime;
            if(this.tweenTime >= this.dur){
                this.inTween = false;
                this.vx = 0;
                this.vy = 0;
            }
        }

        if(this.visible){
            context.fillStyle = this.color;
            switch(this.shape){
                case "square":
                    context.fillRect(this.x - game.camX, this.y - game.camY, this.width, this.height);
                    break;
                case "circle":
                    context.beginPath();
                    // Radius becomes the width, start angle = 0, end angle = 2 PI radians
                    context.arc(this.x - game.camX, this.y - game.camY, this.width, 0, Math.PI * 2);
                    context.fill();
                    break;
            }
        }
    };
    /**
     *
     * @param floor - The maximum Y position for the object before bouncing
     * @param cor  - The coefficient of restitution (The ratio of initial velocity to post bounce velocity; should be from 0-1) -1 for no bounce physics
     */
    this.setCoefficientOfRestitution = function(floor, cor){
        this.floor = floor;
        this.cor = cor;
    };

    this.tween = function(toX, toY, dur){
        this.inTween = true;
        this.toX = toX;
        this.toY = toY;
        this.vx = (toX - this.x)/(dur/1000);
        this.vy = (toY - this.y)/(dur/1000);
        this.dur = dur;
        this.tweenTime = 0;
    };
}

function Sound(src){
    this.sound = document.createElement('audio');
    this.sound.setAttribute('src', src);
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        if(sound)
            this.sound.play();
    };
    this.stop = function(){
        this.sound.pause();
    };
}

/**
 *
 * @param txt Text to display
 * @param font to display
 * @param color of text component
 * @param x pos
 * @param y pos
 * @param fixed is position fixed to camera
 * @constructor
 */
function Text(txt, font, color, x, y, fixed){
    this.txt = txt;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.g = 0;
    this.tv = -1;
    this.fixed = fixed;
    this.color = color;
    this.maxWidth = -1;
    this.update = function(cumTime){
        var sec = cumTime/1000;
        this.vy += this.g*sec;
        this.x += this.vx*cumTime;
        this.y += this.vy*cumTime;
        context.fillStyle = color;
        context.font = font;
        if(fixed){
            context.fillText(this.txt, this.x, this.y);
        }else{
            context.fillText(this.txt, this.x - game.camX, this.y - game.camY);
        }
    }
}

function getSystemTime(){
    var d = new Date();
    return d.getTime();
}

/**
 * From W3Schools
 * @param cname
 * @param cvalue
 * @param exdays
 */
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * From W3Schools
 * @param cname
 * @returns {string}
 */
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        c.trim();
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}