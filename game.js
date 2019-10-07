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
    gameState,
    timeLeft,
    timer,
    timerId;

const gameport = document.getElementById("gameport");
gameport.appendChild(app.view);

loader
    .add('sheet', 'sprites/assets.json')
    .load(initStartMenu);


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
    bambiAliveMovie.visible = false;
    bambiAliveMovie.interactive = true;
    bambiAliveMovie.on('pointerdown', mouseHandler.bind(this));
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

    // lose screen
    let loseScreenTexture = TextureCache["LoseScreen.png"],
        loseScreenCanvas = new Sprite(loseScreenTexture),
        restartBtnTexture = TextureCache["RestartBtn.png"],
        restartBtn = new Sprite(restartBtnTexture);
    loseScreen.addChild(loseScreenCanvas);
    loseScreen.visible = false;
    restartBtn.anchor.set(0.5);
    restartBtn.position.set(app.stage.width / 2, app.stage.height - 200);
    restartBtn.interactive = true;
    restartBtn.on('pointerdown', restart);
    loseScreen.addChild(restartBtn);
    app.stage.addChild(loseScreen);

    // win screen
    let winScreenTexture = TextureCache["WinScreen.png"],
        winScreenCanvas = new Sprite(winScreenTexture),
        winRestartBtn = new Sprite(restartBtnTexture);
    winScreen.addChild(winScreenCanvas);
    winScreen.visible = false;
    winRestartBtn.anchor.set(0.5);
    winRestartBtn.position.set(app.stage.width / 2, app.stage.height - 200);
    winRestartBtn.interactive = true;
    winRestartBtn.on('pointerdown', restart);
    winScreen.addChild(winRestartBtn);
    app.stage.addChild(winScreen);

    // timer
    let style = new TextStyle({
        fontFamily: "Futura",
        fontSize: 64,
        fill: "yellow"
    });

    timer = new Text("", style);
    timer.x = 10;
    timer.y = 0;
    gameScreen.addChild(timer);

    gameState = play;

    app.ticker.add(delta => gameLoop(delta));

    timeLeft = 30;
    timerId = setInterval(countdownTimer, 1000);
}

function countdownTimer()
{
    if (timeLeft == 0)
    {
        clearTimeout(timerId);
        gameState = lose;
    }
    else
    {
        timer.setText(timeLeft);
        timeLeft--;
    }
}

function gameLoop(delta)
{
    gameState(delta);
}

function play(delta)
{
    let hitCount = 0;

    for (var i = 0; i < targets.length; i++)
    {
        if (targets[i].visible == false)
        {
            hitCount++;
        }
    }

    if (hitCount == targets.length)
    {
        bambiAliveMovie.play();
        bambiAliveMovie.visible = true;
    }

}

function win()
{
    gameScreen.visible = false;
    winScreen.visible = true;
}

function lose()
{
    gameScreen.visible = false;
    loseScreen.visible = true;
}

function mouseHandler(e)
{
    app.renderer.plugins.interaction.destroy();

    let self = e.currentTarget,
        bowDestX = self.x,
        startX = bowDrawn.x,
        distanceToTravel = Math.abs(self.x - startX);

    createjs.Tween.get(bowDrawn.position).to({
        x: bowDestX,
        y: app.stage.height},
        distanceToTravel > 0 ? 750 : 250,
        createjs.Ease.linear
    );

    createjs.Tween.get(arrow.position).to({
        x: bowDestX,
        y: app.stage.height - arrow.height},
        distanceToTravel > 0 ? 750 : 250,
        createjs.Ease.linear
    );

    createjs.Tween.get(bowDrawn).wait(distanceToTravel > 0 ? 750 : 250).set({
        visible: false},
    ).call(shotAnimation, [self] );
}

function shotAnimation(self)
{
    let arrowDestX = self.x,
        arrowDestY = self.y + self.height/2;

    bowReleased.position.set(self.x, app.stage.height - bowDrawn.height + bowReleased.height);
    bowReleased.visible = true;

    createjs.Tween.get(arrow.position).to({
        x: arrowDestX,
        y: arrowDestY },
        500,
        createjs.Ease.linear
    );

    createjs.Tween.get(self).wait(750).to({
        alpha: 0,
        visible: false},
        250
    ).call(resetShotTo, [self] );
}

function resetShotTo(self)
{
    createjs.Tween.get(arrow).to({
        alpha: 0,
        visible: false},
        250
    );

    createjs.Tween.get(bowReleased).wait(250).set({
        alpha: 0,
        visible: false},
    );

    createjs.Tween.get(arrow.position).wait(250).set({
        x: self.x,
        y: app.stage.height - arrow.height},
    );

    createjs.Tween.get(arrow).wait(750).set({
        alpha: 1,
        visible: true}
    );

    createjs.Tween.get(bowDrawn).wait(750).set({
        alpha: 1,
        visible: true }
    );

    if( bambiAliveMovie == self )
    {
        gameState = win;
    }
    app.renderer.plugins.interaction = new PIXI.interaction.InteractionManager(app.renderer);
}

function restart()
{
    if(startScreen.visible != true)
    {
        location.reload();
    }
}

function randomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}