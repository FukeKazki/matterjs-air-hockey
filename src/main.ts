import './style.css';
import Matter from 'matter-js';
import LeftWall from './assets/left_wall.svg';

const Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;

const engine = Engine.create();

const render = Render.create({
  element: document.getElementById('app')!,
  engine: engine,
  options: {
    width: 320,
    height: 568,
    wireframes: false,
  },
});

const canvas = {
  width: 320,
  height: 580,
};

Render.run(render);

// create runner
const runner = Runner.create();

// run the engine
Runner.run(runner, engine);

const vertices = Matter.SVG.pathToVertices(LeftWall, 10);
console.log(vertices);
const top = Bodies.rectangle(canvas.width / 2, 950, 700, 60, {
  isStatic: true,
  friction: 1,
  mass: 100,
});

Composite.add(engine.world, [top]);
