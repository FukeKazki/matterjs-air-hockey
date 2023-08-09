// import "./style.css";
import "./reset.css";
import Matter from "matter-js";
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

Matter.Common.setDecomp(decomp);
const Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;

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
let canvasWidth, canvasHeight;
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

const paddle = Bodies.circle(200, 200, 25, {
  slop: 0,
  frictionAir: 1,
  inverseInertia: 0,
});
// ホッケーのボール（球）を作成
const puck = Bodies.circle(250, 300, 20, {
  label: "puck",
  restitution: 0.5,
  friction: 0,
  frictionAir: 0.005,
  slop: 0,
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
function handleBeforeUpdate() {
  // const clamp = 60;
  // const clampedVelocity = puck.velocity;
  // if (puck.velocity.x > clamp) {
  //   clampedVelocity.x = clamp;
  // }
  // if (puck.velocity.y > clamp) {
  //   clampedVelocity.y = clamp;
  // }
  // Matter.Body.setVelocity(puck, clampedVelocity);
  // clampPaddlePosition(paddle);
  // clampPaddlePosition(paddle2);
}
// function clampPaddlePosition(paddle: Matter.Body) {
//   const projectedX = paddle.position.x + paddle.velocity.x;
//   const projectedY = paddle.position.y + paddle.velocity.y;
//   if (projectedX > canvas.width - 44) {
//     Body.setPosition(paddle, { x: canvas.width - 44, y: paddle.position.y });
//   }
//   if (projectedX < 44) {
//     Body.setPosition(paddle, { x: 44, y: paddle.position.y });
//   }
//   if (projectedY > canvas.height - 44) {
//     Body.setPosition(paddle, { x: paddle.position.x, y: canvas.height - 44 });
//   }
//   if (projectedY < 44) {
//     Body.setPosition(paddle, { x: paddle.position.x, y: 44 });
//   }
// }

// マウスのドラッグイベントを使用して、パドルを操作
const mouse = Matter.Mouse.create(render.canvas);
const mouseConstraint = Matter.MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 1,
    render: { visible: false },
  },
});
mouseConstraint.mouse.button = -1; // 最初のクリックを無効にするため
// マウスのドラッグイベントのハンドラ
Matter.Events.on(mouseConstraint, "mousemove", (event) => {
  const { mouse } = event.source;
  Matter.Body.setPosition(paddle, {
    x: mouse.position.x,
    y: mouse.position.y,
  });
});

Matter.Events.on(engine, "beforeUpdate", () => handleBeforeUpdate());
Composite.add(engine.world, [
  left,
  right,
  paddle,
  puck,
  mouseConstraint,
  goal1,
  goal2,
]);
