const Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Texture = PIXI.Texture,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache,
    Graphics = PIXI.Graphics,
    Text = PIXI.Text,
    AnimatedSprite = PIXI.extras.AnimatedSprite,
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
    timerId,
    winMp3,
    loseMp3,
    startMp3,
    targetHitMp3,
    arrowMp3;

const gameport = document.getElementById("gameport");
gameport.appendChild(app.view);

loader.add("sprites/assets.json")
    .load(initStartMenu);

sounds.load([
    "audio/start.mp3",
    "audio/win.mp3",
    "audio/lose.mp3",
    "audio/arrow.mp3",
    "audio/targetHit.mp3"
]);

sounds.whenLoaded = soundInit;

function soundInit()
{
    // add mp3 audio clips
    winMp3 = sounds["audio/win.mp3"];
    loseMp3 = sounds["audio/lose.mp3"];
    startMp3 = sounds["audio/start.mp3"];
    arrowMp3 = sounds["audio/arrow.mp3"];
    targetHitMp3 = sounds["audio/targetHit.mp3"];
}

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

function initGame()
{
    // play start sound
    startMp3.play();

    // get rid of start screen and add game screen
    startScreen.visible = false;
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

    bambiAliveMovie = new AnimatedSprite(bambiAlive);
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


    targets = new Container();
    gameScreen.addChild(targets);
    targets.interactive = true;

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
        targets.addChild(target);
        //gameScreen.addChild(target);
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
        targets.addChild(target);
        //gameScreen.addChild(target);
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
        target.on('pointerdown', mouseHandler.bind(this));
        targets.addChild(target);
        //gameScreen.addChild(target);
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

    timeLeft = 45;
    timerId = setInterval(countdownTimer, 1000);
}

function countdownTimer()
{
    if (timeLeft == 0 && winScreen.visible == false)
    {
        clearTimeout(timerId);
        loseMp3.play();
        gameState = lose;
    }
    else
    {
        timer.text = timeLeft;
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

    for (var i = 0; i < targets.children.length; i++)
    {
        if (targets.children[i].visible == false)
        {
            hitCount++;
        }
    }

    if (hitCount == targets.children.length)
    {
        if( bambiAliveMovie.visible == false)
        {
            app.renderer.plugins.interaction = new PIXI.interaction.InteractionManager(app.renderer);
            targets.visible = false;
            bambiAliveMovie.play();
            bambiAliveMovie.scale.set(1.5);
            bambiAliveMovie.visible = true;
            animateBambi();
        }
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

function animateBambi()
{
    createjs.Tween.get(bambiAliveMovie, { loop: true })
        .to({x: randomInt(bambiAliveMovie.width/2, app.stage.width - bambiAliveMovie.width/2)}, 250, createjs.Ease.getPowInOut(4))
        .to({alpha: 0, y: randomInt(bambiAliveMovie.height/2, app.stage.height - bambiAliveMovie.height/2)}, 500, createjs.Ease.getPowInOut(2))
        .to({alpha: 1, y: randomInt(bambiAliveMovie.height/2, app.stage.height - bambiAliveMovie.height/2)}, 500)
        .to({alpha: 0, y: randomInt(bambiAliveMovie.height/2, app.stage.height - bambiAliveMovie.height/2)}, 500, createjs.Ease.getPowInOut(2))
        .to({x: randomInt(bambiAliveMovie.width/2, app.stage.width - bambiAliveMovie.width/2)}, 500, createjs.Ease.getPowInOut(2));
}

function mouseHandler(e)
{
    // disable clicks
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

    arrowMp3.play();

    createjs.Tween.get(arrow.position).to({
        x: arrowDestX,
        y: arrowDestY },
        500,
        createjs.Ease.linear
    );

    createjs.Tween.get(self).wait(500).to({
        alpha: 0,
        visible: false},
        250
    ).call(resetShotTo, [self] );
}

function resetShotTo(self)
{
    targetHitMp3.play();

    createjs.Tween.get(arrow).to({
        alpha: 0,
        visible: false},
        250
    );

    createjs.Tween.get(bowReleased).wait(750).set({
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

    app.renderer.plugins.interaction = new PIXI.interaction.InteractionManager(app.renderer);

    if( bambiAliveMovie == self )
    {
        winMp3.play();
        gameState = win;
    }
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