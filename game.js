const Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite,
    AnimatedSprite = PIXI.extras.AnimatedSprite,
    TextureCache = PIXI.TextureCache,
    Graphics = PIXI.Graphics,
    Text = PIXI.Text,
    MovieClip = PIXI.extras.MovieClip,
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
    bowDrawn,
    bowReleased,
    targets,
    arrow,
    bambiAlive,
    bambiAliveMovie,
    gameState;

const gameport = document.getElementById("gameport");
gameport.appendChild(app.view);

loader
    .add('sheet', 'sprites/assets.json')
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
    gameScreen.sorta
    app.stage.addChild(gameScreen);

    let gameTexture = TextureCache["GameScreen.png"],
        gameCanvas = new Sprite(gameTexture);

    gameScreen.addChild(gameCanvas);

    // create bow sprite
    let bowDrawnTexture = TextureCache["BowDrawn.png"];
    bowDrawn = new Sprite(bowDrawnTexture);
    // add bow to game
    bowDrawn.anchor.set(0.5, 1);
    bowDrawn.position.set(176, app.stage.height);
    gameScreen.addChild(bowDrawn);


    // add bow release for use in animations
    let bowReleasedTexture = TextureCache["BowReleased.png"];
    bowReleased = new Sprite(bowReleasedTexture);
    bowReleased.visible = false;
    bowReleased.position.set(bowDrawn.x, bowDrawn.y);
    bowReleased.anchor.set(0.5, 1);
    gameScreen.addChild(bowReleased);

    // add bambi alive animation
    bambiAlive = [];

    for( var i = 1; i < 7; i++ )
    {
        bambiAlive.push(TextureCache['Bambi' + i + '.png']);
    }

    bambiAliveMovie = new MovieClip(bambiAlive);
    bambiAliveMovie.position.set( app.stage.width/2, app.stage.height/4);
    bambiAliveMovie.anchor.set(0.5);
    bambiAliveMovie.animationSpeed = .1;
    bambiAliveMovie.play();
    bambiAliveMovie.visible = false;
    gameScreen.addChild(bambiAliveMovie);

    // creat target sprites
    let numTargets = 9,
        initialxPos = 175,
        xOffset = 225,
        ySpacing = 0;


    targets = [];

    // 1st col targets
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
        target.interactive = true;
        target.buttonMode = true;
        target.on('pointerdown', mouseHandler.bind(this));
        targets.push(target);
        gameScreen.addChild(target);
    }

    // reset yspacing
    ySpacing = 0;

    // 2nd col targets
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
        target.interactive = true;
        target.buttonMode = true;
        target.on('pointerdown', mouseHandler.bind(this));
        targets.push(target);
        gameScreen.addChild(target);
    }

    // reset yspacing
    ySpacing = 0;

    // 3rd col targets
    for( var i = 6; i < numTargets; i++)
    {
        let targetTexture = TextureCache["Target.png"],
            target = new Sprite(targetTexture);

        target.anchor.set(.5, 0);
        target.scale.set(randomInt(2, 75) * 0.01);

        let x = initialxPos + xOffset * 2,
            y = ySpacing;

        ySpacing += 125;

        target.position.set(x, y);
        target.interactive = true;
        target.buttonMode = true;
        target.on('pointerdown', mouseHandler.bind(this));
        targets.push(target);
        gameScreen.addChild(target);
    }

    let arrowTexture = TextureCache["Arrow.png"];
    arrow = new Sprite(arrowTexture);
    arrow.zIndex
    arrow.anchor.set(0.5, 0);
    arrow.position.set( bowDrawn.x, bowDrawn.y - arrow.height);
    arrow.visible = true;
    gameScreen.addChild(arrow);

    gameState = play;

    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta)
{
    gameState(delta);
}

function play(delta)
{

}

function mouseHandler(e)
{
    let self = e.currentTarget,
        bowDestX = self.x,
        startX = bowDrawn.x;

    console.log(self.x - startX);

    createjs.Tween.get(bowDrawn.position).to({
        x: bowDestX,
        y: app.stage.height},
        self.x - startX == 225 || self.x - startX == -225? 850 : 1250,
        createjs.Ease.linear
    );

    createjs.Tween.get(arrow.position).to({
        x: bowDestX,
        y: app.stage.height - arrow.height},
        self.x - startX == 225 || self.x - startX == -225? 850 : 1250,
        createjs.Ease.linear
    );

    createjs.Tween.get(bowDrawn).to({
        visible: false},
        self.x - startX == 225 || self.x - startX == -225? 850 : 1250,
    ).call(shotAnimation, [self, startX] );
}

function shotAnimation(self, startX)
{
    let arrowDestX = self.x,
        arrowDestY = self.y + self.height/2;

    bowReleased.position.set(self.x, app.stage.height - bowDrawn.height + bowReleased.height);
    bowReleased.visible = true;

    createjs.Tween.get(arrow.position).to({
        x: arrowDestX,
        y: arrowDestY },
        self.x - startX == 225 || self.x - startX == -225? 850 : 1250,
        createjs.Ease.linear
    ).call(resetShotTo, [arrowDestX, arrowDestY] );
}

function resetShotTo(x, y)
{
    createjs.Tween.get(arrow).wait(500).to({
        opacity: 0,
        visible: false},
        500
    );

    createjs.Tween.get(bowReleased).wait(500).to({
        opacity: 0,
        visible: false},
        500
    );


}

function randomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}