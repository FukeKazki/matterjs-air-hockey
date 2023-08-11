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
import ChottySvg from "./assets/chotty/chotty.svg";
import ChottyPng from "./assets/chotty/chotty.png";
import ChottyMogumoguSvg from "./assets/chotty/mogumogu.svg";
import ChottyMogumoguPng from "./assets/chotty/mogumogu.png";
import ChottyDanceSvg from "./assets/chotty/dance.svg";
import ChottyDancePng from "./assets/chotty/dance.png";
import ChottyOmedetouSvg from "./assets/chotty/omedetou.svg";
import ChottyOmedetouPng from "./assets/chotty/omedetou.png";
// @ts-expect-error
import decomp from "poly-decomp";
import {
  getObjectWidth,
  getVerticesFromSvg,
  fitCanvas,
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

const loadAssets = async (url: string[]) => {
  return Promise.all(url.map((v) => getVerticesFromSvg(v)));
};

const [
  leftWall,
  rightWall,
  chottyVertices,
  chottyMogumoguVertices,
  chottyDanceVertices,
  chottyOmedetouVertices,
] = await loadAssets([
  LeftWallSvg,
  RightWallSvg,
  ChottySvg,
  ChottyMogumoguSvg,
  ChottyDanceSvg,
  ChottyOmedetouSvg,
]);
// svg to vertices
const chotty = Bodies.fromVertices(0, 0, chottyVertices ?? [], {
  render: {
    sprite: {
      single: true,
      texture: ChottyPng,
      yScale: 0.5, // テクスチャのscale を調整するときは、Body.scale と同じ値を設定する必要があります。
      xScale: 0.5,
    },
  },
  restitution: 0.9,
});
setPositionFromTopLeft(chotty, 300, 300);
Body.scale(chotty, 0.5, 0.5);

const chottyMogumogu = Bodies.fromVertices(0, 0, chottyMogumoguVertices ?? [], {
  render: {
    sprite: {
      single: true,
      texture: ChottyMogumoguPng,
      yScale: 0.5, // テクスチャのscale を調整するときは、Body.scale と同じ値を設定する必要があります。
      xScale: 0.5,
    },
  },
  restitution: 0.9,
});
setPositionFromTopLeft(chottyMogumogu, 300, 200);
Body.scale(chottyMogumogu, 0.5, 0.5);

const chottyDance = Bodies.fromVertices(0, 0, chottyDanceVertices ?? [], {
  render: {
    sprite: {
      single: true,
      texture: ChottyDancePng,
      yScale: 0.5,
      xScale: 0.5,
    },
  },
});
setPositionFromTopLeft(chottyDance, 300, 400);
Body.scale(chottyDance, 0.5, 0.5);

const chottyOmedetou = Bodies.fromVertices(0, 0, chottyOmedetouVertices ?? [], {
  render: {
    sprite: {
      single: true,
      texture: ChottyOmedetouPng,
      yScale: 0.5,
      xScale: 0.5,
    },
  },
});
setPositionFromTopLeft(chottyOmedetou, 300, 500);
Body.scale(chottyOmedetou, 0.5, 0.5);

const left = Bodies.fromVertices(0, 0, leftWall ?? [], {
  isStatic: true,
  render: {
    fillStyle: "#FABE00",
  },
  restitution: 1, // 反発係数
  frictionAir: 0.01,
  friction: 0,
});
fitCanvas(left, canvasHeight);
setPositionFromTopLeft(left);

const right = Bodies.fromVertices(0, 0, rightWall ?? [], {
  isStatic: true,
  render: {
    fillStyle: "#FABE00",
  },
  restitution: 1,
  frictionAir: 0.01,
  friction: 0,
});
fitCanvas(right, canvasHeight);
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
  mass: 1000,
});
// ホッケーのボール（球）を作成
const puck = Bodies.circle(250, 300, 20, {
  label: "puck",
  restitution: 0.9,
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
  chotty,
  chottyMogumogu,
  chottyDance,
  chottyOmedetou,
]);

Events.on(engine, "afterUpdate", function() {
  // ボールの位置を確認します。
  if (
    puck.position.x < 0 ||
    puck.position.x > canvasWidth ||
    puck.position.y < 0 ||
    puck.position.y > canvasHeight
  ) {
    // ボールがcanvasの範囲外にある場合、ボールを新しい位置に再配置します。
    Body.setPosition(puck, {
      x: canvasWidth / 2, // canvasの中央に再配置
      y: canvasHeight / 2,
    });

    // 任意の初速度や方向にボールを動かす場合は以下のように速度を設定します。
    Body.setVelocity(puck, { x: 0, y: 0 }); // 速度をリセット
  }
});
