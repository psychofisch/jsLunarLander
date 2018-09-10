var   Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Composites = Matter.Composites,
      Common = Matter.Common,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      World = Matter.World,
      Query = Matter.Query,
      Svg = Matter.Svg,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Vector = Matter.Vector,
      physEngine,
      Player = {};

function resetPlayer()
{
  Body.setPosition(Player.model, {x:450,y:20});
}

function gameLoop(dt)
{
  if(Player.accel)
  {
    var force = 0.0005,
        angleRel = {};
    angleRel.x = -Math.sin(Player.model.angle);
    angleRel.y = Math.cos(Player.model.angle);
    var angleRelVec = {};
    angleRelVec.x = Player.model.force.x * angleRel.x;
    angleRelVec.y = Player.model.force.y * angleRel.y;
    var forceLength = Vector.magnitude(angleRelVec);

    if(forceLength < 0.001)
    {
      Body.applyForce(Player.model, Player.model.position, Vector.mult(angleRel, -force));
      //console.log("Boost!");
    }
  }

  Engine.update(physEngine, 1000 / 60);
  window.requestAnimationFrame(gameLoop);
}

window.onload = function() {
    // create engine
    physEngine = Engine.create();
    var world = physEngine.world;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: physEngine
    });

    Render.run(render);

    // run physics engine
    gameLoop(1);

    // add level
    var terrain;
    $.get('./lvl_test.svg').done(function(data) {
        var vertexSets = [];

        $(data).find('path').each(function(i, path) {
            vertexSets.push(Svg.pathToVertices(path, 30));
        });

        terrain = Bodies.fromVertices(450, 450, vertexSets, {
            isStatic: true,
            render: {
                fillStyle: '#2e2b44',
                strokeStyle: '#2e2b44',
                lineWidth: 1
            }
        }, true);

        World.add(world, terrain);
    });

    // add player
    Player.model = Bodies.rectangle(0, 0, 20, 20);
    World.add(world, Player.model);
    resetPlayer();
    Player.accel = false;
    Player.model.mass = 1;

    // set game properties
    world.gravity.y = 0.5;
    world.gravity.scale = 0.0001;

    // controls
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(physEngine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    $(window).keydown(function(e){
      if(e.key == 'w')
      {
        Player.accel = true;
      }
      else if(e.key == 'a' || e.key == 'd')
      {
        var rotSpeed = 0.02;
        if(e.key == 'a')
          rotSpeed *= -1;
        Body.setAngularVelocity(Player.model, rotSpeed);
      }
      else if(e.key == 'r')
      {
        resetPlayer();
      }
    });

    $(window).keyup(function(e){
      if(e.key == 'w')
      {
        Player.accel = false;
      }
      else if(e.key == 'a' || e.key == 'd')
      {
        var rotSpeed = 0.01;
        if(e.key == 'a')
          rotSpeed *= -1;
        Body.setAngularVelocity(Player.model, rotSpeed);
      }
      else if(e.key == 'r')
      {
        resetPlayer();
      }
    });

    World.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });
}
