import "./reset.css";
import "./pathseg.js";
import {
  Engine,
  Render,
  Runner,
  Bodies,
  Body,
  Composite,
  Common,
  Mouse,
  MouseConstraint,
  Events,
} from "matter-js";
import LeftWallSvg from "./assets/left_wall.svg";
import RightWallSvg from "./assets/right_wall.svg";
// @ts-expect-error
import decomp from "poly-decomp";
import {
  getObjectWidth,
  getVerticesFromSvg,
  scaleObject,
  setPositionFromTopLeft,
} from "./helper";

Common.setDecomp(decomp);

const engine = Engine.create({
  gravity: {
    x: 0,
    y: 0,
  },
  velocityIterations: 16,
});

const aspectRatio = 320 / 568;

// ビューポートのサイズを取得
const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

// canvas のサイズを計算
let canvasWidth: number, canvasHeight: number;
if (viewportWidth / viewportHeight > aspectRatio) {
  canvasHeight = viewportHeight;
  canvasWidth = canvasHeight * aspectRatio;
} else {
  canvasWidth = viewportWidth;
  canvasHeight = canvasWidth / aspectRatio;
}

const render = Render.create({
  element: document.getElementById("app")!,
  engine: engine,
  options: {
    width: canvasWidth,
    height: canvasHeight,
    wireframes: false,
    showVelocity: true,
    showCollisions: true,
  },
});

Render.run(render);

// create runner
const runner = Runner.create();

// run the engine
Runner.run(runner, engine);

// svg to vertices
const leftWall = await getVerticesFromSvg(LeftWallSvg);
const rightWall = await getVerticesFromSvg(RightWallSvg);
const left = Bodies.fromVertices(0, 0, [leftWall ?? []], {
  isStatic: true,
  render: {
    fillStyle: "#FABE00",
  },
  restitution: 1,
  frictionAir: 0.01,
  friction: 0,
});
scaleObject(left, canvasHeight);
setPositionFromTopLeft(left);

const right = Bodies.fromVertices(0, 0, [rightWall ?? []], {
  isStatic: true,
  render: {
    fillStyle: "#FABE00",
  },
  restitution: 1,
  frictionAir: 0.01,
  friction: 0,
});
scaleObject(right, canvasHeight);
setPositionFromTopLeft(right, canvasWidth - getObjectWidth(right));

const paddle = Bodies.circle(200, 200, 30, {
  slop: 0,
  frictionAir: 1,
  inverseInertia: 0,
  render: {
    fillStyle: "#E04141",
    lineWidth: 4,
    strokeStyle: "#7C1111",
  },
});
// ホッケーのボール（球）を作成
const puck = Bodies.circle(250, 300, 20, {
  label: "puck",
  restitution: 0.5,
  friction: 0,
  frictionAir: 0.005,
  slop: 0,
  render: {
    fillStyle: "#fff",
  },
});

const goal1 = Bodies.rectangle(
  0,
  0,
  canvasWidth - getObjectWidth(left) * 2,
  16,
  {
    isStatic: true,
    render: {
      fillStyle: "#D9D9D9",
    },
  },
);
setPositionFromTopLeft(goal1, getObjectWidth(left), 0);
const goal2 = Bodies.rectangle(
  0,
  0,
  canvasWidth - getObjectWidth(left) * 2,
  16,
  {
    isStatic: true,
    render: {
      fillStyle: "#D9D9D9",
    },
  },
);
setPositionFromTopLeft(goal2, getObjectWidth(left), canvasHeight - 16);

// マウスのドラッグイベントを使用して、パドルを操作
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: { visible: false },
  },
});
mouseConstraint.mouse.button = -1; // 最初のクリックを無効にするため
// マウスのドラッグイベントのハンドラ
Events.on(mouseConstraint, "mousemove", (event) => {
  const { mouse } = event.source;
  Body.setPosition(paddle, {
    x: mouse.position.x,
    y: mouse.position.y,
  });
});

Composite.add(engine.world, [
  left,
  right,
  paddle,
  puck,
  mouseConstraint,
  goal1,
  goal2,
]);
