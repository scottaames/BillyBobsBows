const Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.TextureCache,
    Graphics = PIXI.Graphics,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle;

const app = new Application({
    width: 800,
    height: 800,
    antialias: true,
    transparent: false,
    resolution: 1,
});

let gameScreen = new Container(),
    startScreen = new Container(),
    loseScreen = new Container(),
    winScreen = new Container(),
    bowFullDraw,
    targets;

const gameport = document.getElementById("gameport");
gameport.appendChild(app.view);

loader
    .add('sprites/assets.json')
    .load(initGame);


function initStartMenu() {

    // create start screen textures/sprites
    let startTexture = TextureCache["StartScreen.png"],
        startCanvas = new Sprite(startTexture),
        startButtonTexture = TextureCache["StartBtn.png"],
        startButton = new Sprite(startButtonTexture);

    // add start screen to
    startScreen.addChild(startCanvas);
    startScreen.addChild(startButton);
    startButton.position.set(550, 600);
    app.stage.addChild(startScreen);

    // make start button interactive and lead to game
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on('pointerdown', initGame);
}

function initGame() {

    startScreen.visible = false;

    app.stage.addChild(gameScreen);

    let gameTexture = TextureCache["GameScreen.png"],
        gameCanvas = new Sprite(gameTexture);

    gameScreen.addChild(gameCanvas);

    // create bow sprite
    let bowFullDrawTexture = TextureCache["BowAndArrowFullDraw.png"],
        bowFullDraw = new Sprite(bowFullDrawTexture);

    // add bow to game
    bowFullDraw.anchor.set(0, 0);
    bowFullDraw.position.set(99, app.stage.height);
    bowFullDraw.pivot.set(0.5, 0.5);
    bowFullDraw.rotation = 4.71239;
    bowFullDraw.scale.set(0.75, 0.75);
    gameScreen.addChild(bowFullDraw);

    // creat target sprites

    let numTargets = 9,
        rows = 3,
        initialxPos = 176,
        xOffset = 226,
        ySpacing = 0;


    targets = [];

    // 1st row targets
    for( var i = 0; i < numTargets - 6; i++)
    {
        let targetTexture = TextureCache["Target.png"],
            target = new Sprite(targetTexture);

        target.anchor.set(.5, 0);
        target.scale.set(randomInt(5, 75) * 0.01);

        let x = initialxPos,
            y = ySpacing;

        ySpacing += 125;

        target.position.set(x, y);
        targets.push(target);
        gameScreen.addChild(target);
    }

    // reset yspacing
    ySpacing = 0;

    // 2nd row targets
    for( var i = 3; i < numTargets - 3; i++)
    {
        let targetTexture = TextureCache["Target.png"],
            target = new Sprite(targetTexture);

        target.anchor.set(.5, 0);
        target.scale.set(randomInt(2, 75) * 0.01);

        let x = initialxPos + xOffset,
            y = ySpacing;

        ySpacing += 125;

        target.position.set(x, y);
        targets.push(target);
        gameScreen.addChild(target);
    }

}







function randomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
