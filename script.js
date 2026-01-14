import * as THREE from "https://esm.sh/three";

const minTileIndex = -8;
const maxTileIndex = 8;
const tilesPerRow = maxTileIndex - minTileIndex + 1;
const tileSize = 42;

function Camera() {
  const size = 300;
  const viewRatio = window.innerWidth / window.innerHeight;
  const width = viewRatio < 1 ? size : size * viewRatio;
  const height = viewRatio < 1 ? size / viewRatio : size;

  const camera = new THREE.OrthographicCamera(
    width / -2, width / 2, height / 2, height / -2, 100, 900
  );

  camera.up.set(0, 0, 1);
  camera.position.set(300, -300, 300);
  camera.lookAt(0, 0, 0);
  return camera;
}

function Texture(width, height, rects) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "rgba(0,0,0,0.6)";
  rects.forEach((rect) => {
    context.fillRect(rect.x, rect.y, rect.w, rect.h);
  });
  return new THREE.CanvasTexture(canvas);
}

const carFrontTexture = new Texture(40, 80, [{ x: 0, y: 10, w: 30, h: 60 }]);
const carBackTexture = new Texture(40, 80, [{ x: 10, y: 10, w: 30, h: 60 }]);
const carRightSideTexture = new Texture(110, 40, [{ x: 10, y: 0, w: 50, h: 30 }, { x: 70, y: 0, w: 30, h: 30 }]);
const carLeftSideTexture = new Texture(110, 40, [{ x: 10, y: 10, w: 50, h: 30 }, { x: 70, y: 10, w: 30, h: 30 }]);
const truckFrontTexture = Texture(30, 30, [{ x: 5, y: 0, w: 10, h: 30 }]);
const truckRightSideTexture = Texture(25, 30, [{ x: 15, y: 5, w: 10, h: 10 }]);
const truckLeftSideTexture = Texture(25, 30, [{ x: 15, y: 15, w: 10, h: 10 }]);

function Wheel(x) {
  const wheel = new THREE.Mesh(
    new THREE.BoxGeometry(12, 33, 12),
    new THREE.MeshLambertMaterial({ color: 0x333333, flatShading: true })
  );
  wheel.position.x = x;
  wheel.position.z = 6;
  return wheel;
}

function Car(initialTileIndex, direction, color) {
  const car = new THREE.Group();
  car.position.x = initialTileIndex * tileSize;
  if (!direction) car.rotation.z = Math.PI;

  const main = new THREE.Mesh(
    new THREE.BoxGeometry(60, 30, 15),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  main.position.z = 12;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(33, 24, 12), [
    new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true, map: carBackTexture }),
    new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true, map: carFrontTexture }),
    new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true, map: carRightSideTexture }),
    new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true, map: carLeftSideTexture }),
    new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true }),
    new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true }),
  ]);
  cabin.position.x = -6; cabin.position.z = 25.5;
  cabin.castShadow = true; cabin.receiveShadow = true;
  car.add(cabin);
  car.add(Wheel(18));
  car.add(Wheel(-18));
  return car;
}

function Truck(initialTileIndex, direction, color) {
  const truck = new THREE.Group();
  truck.position.x = initialTileIndex * tileSize;
  if (!direction) truck.rotation.z = Math.PI;

  const cargo = new THREE.Mesh(
    new THREE.BoxGeometry(70, 35, 35),
    new THREE.MeshLambertMaterial({ color: 0xb4c6fc, flatShading: true })
  );
  cargo.position.x = -15; cargo.position.z = 25;
  cargo.castShadow = true; cargo.receiveShadow = true;
  truck.add(cargo);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), [
    new THREE.MeshLambertMaterial({ color, flatShading: true, map: truckFrontTexture }),
    new THREE.MeshLambertMaterial({ color, flatShading: true }),
    new THREE.MeshLambertMaterial({ color, flatShading: true, map: truckLeftSideTexture }),
    new THREE.MeshLambertMaterial({ color, flatShading: true, map: truckRightSideTexture }),
    new THREE.MeshPhongMaterial({ color, flatShading: true }),
    new THREE.MeshPhongMaterial({ color, flatShading: true }),
  ]);
  cabin.position.x = 35; cabin.position.z = 20;
  cabin.castShadow = true; cabin.receiveShadow = true;
  truck.add(cabin);
  truck.add(Wheel(37));
  truck.add(Wheel(5));
  truck.add(Wheel(-35));
  return truck;
}

function Grass(rowIndex) {
  const grass = new THREE.Group();
  grass.position.y = rowIndex * tileSize;

  const createSection = (color) =>
    new THREE.Mesh(
      new THREE.BoxGeometry(tilesPerRow * tileSize, tileSize, 3),
      new THREE.MeshLambertMaterial({ color })
    );

  const middle = createSection(0xbaf455);
  middle.receiveShadow = true;
  grass.add(middle);

  const left = createSection(0x99c846);
  left.position.x = -tilesPerRow * tileSize;
  grass.add(left);

  const right = createSection(0x99c846);
  right.position.x = tilesPerRow * tileSize;
  grass.add(right);

  return grass;
}

function Road(rowIndex) {
  const road = new THREE.Group();
  road.position.y = rowIndex * tileSize;

  const createSection = (color) =>
    new THREE.Mesh(
      new THREE.PlaneGeometry(tilesPerRow * tileSize, tileSize),
      new THREE.MeshLambertMaterial({ color })
    );

  const middle = createSection(0x454a59);
  middle.receiveShadow = true;
  road.add(middle);

  const left = createSection(0x393d49);
  left.position.x = -tilesPerRow * tileSize;
  road.add(left);

  const right = createSection(0x393d49);
  right.position.x = tilesPerRow * tileSize;
  road.add(right);

  return road;
}

function Tree(tileIndex, height) {
  const tree = new THREE.Group();
  tree.position.x = tileIndex * tileSize;
  const trunk = new THREE.Mesh(
    new THREE.BoxGeometry(15, 15, 20),
    new THREE.MeshLambertMaterial({ color: 0x4d2926, flatShading: true })
  );
  trunk.position.z = 10;
  tree.add(trunk);
  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(30, 30, height),
    new THREE.MeshLambertMaterial({ color: 0x7aa21d, flatShading: true })
  );
  crown.position.z = height / 2 + 20;
  crown.castShadow = true; crown.receiveShadow = true;
  tree.add(crown);
  return tree;
}

function DirectionalLight() {
  const dirLight = new THREE.DirectionalLight();
  dirLight.position.set(-100, -100, 200);
  dirLight.up.set(0, 0, 1);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.left = -400;
  dirLight.shadow.camera.right = 400;
  dirLight.shadow.camera.top = 400;
  dirLight.shadow.camera.bottom = -400;
  return dirLight;
}

function Player() {
  const player = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(15, 15, 20),
    new THREE.MeshLambertMaterial({ color: "white", flatShading: true })
  );
  body.position.z = 10;
  body.castShadow = true;
  body.receiveShadow = true;
  player.add(body);

  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(2, 4, 2),
    new THREE.MeshLambertMaterial({ color: 0xf0619a, flatShading: true })
  );
  cap.position.z = 21;
  player.add(cap);

  const playerContainer = new THREE.Group();
  playerContainer.add(player);
  return playerContainer;
}

const metadata = [];
const map = new THREE.Group();
const player = Player();
const position = { currentRow: 0, currentTile: 0 };
const movesQueue = [];

function addRows() {
  const newMetadata = generateRows(20);
  const startIndex = metadata.length;
  metadata.push(...newMetadata);

  newMetadata.forEach((rowData, index) => {
    const rowIndex = startIndex + index + 1;
    if (rowData.type === "forest") {
      const row = Grass(rowIndex);
      rowData.trees.forEach(({ tileIndex, height }) => row.add(Tree(tileIndex, height)));
      map.add(row);
    } else if (rowData.type === "car" || rowData.type === "truck") {
      const row = Road(rowIndex);
      rowData.vehicles.forEach((vehicle) => {
        const ref = rowData.type === "car" ? Car(vehicle.initialTileIndex, rowData.direction, vehicle.color) : Truck(vehicle.initialTileIndex, rowData.direction, vehicle.color);
        vehicle.ref = ref;
        row.add(ref);
      });
      map.add(row);
    }
  });
}

function generateRows(amount) {
  return Array.from({ length: amount }, () => {
    const type = randomElement(["car", "truck", "forest"]);
    if (type === "car") return generateCarLaneMetadata();
    if (type === "truck") return generateTruckLaneMetadata();
    return generateForesMetadata();
  });
}

function randomElement(array) { return array[Math.floor(Math.random() * array.length)]; }

function generateForesMetadata() {
  const occupiedTiles = new Set();
  const trees = Array.from({ length: 4 }, () => {
    let tileIndex;
    do { tileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex); } while (occupiedTiles.has(tileIndex));
    occupiedTiles.add(tileIndex);
    return { tileIndex, height: randomElement([20, 45, 60]) };
  });
  return { type: "forest", trees };
}

function generateCarLaneMetadata() {
  const direction = randomElement([true, false]);
  const speed = randomElement([125, 156, 188]);
  const occupiedTiles = new Set();
  const vehicles = Array.from({ length: 3 }, () => {
    let initialTileIndex;
    do { initialTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex); } while (occupiedTiles.has(initialTileIndex));
    occupiedTiles.add(initialTileIndex - 1); occupiedTiles.add(initialTileIndex); occupiedTiles.add(initialTileIndex + 1);
    return { initialTileIndex, color: randomElement([0xa52523, 0xbdb638, 0x78b14b]) };
  });
  return { type: "car", direction, speed, vehicles };
}

function generateTruckLaneMetadata() {
  const direction = randomElement([true, false]);
  const speed = randomElement([125, 156, 188]);
  const occupiedTiles = new Set();
  const vehicles = Array.from({ length: 2 }, () => {
    let initialTileIndex;
    do { initialTileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex); } while (occupiedTiles.has(initialTileIndex));
    occupiedTiles.add(initialTileIndex - 2); occupiedTiles.add(initialTileIndex); occupiedTiles.add(initialTileIndex + 2);
    return { initialTileIndex, color: randomElement([0xa52523, 0xbdb638, 0x78b14b]) };
  });
  return { type: "truck", direction, speed, vehicles };
}

function initializeMap() {
  metadata.length = 0;
  map.remove(...map.children);
  for (let rowIndex = 0; rowIndex > -10; rowIndex--) map.add(Grass(rowIndex));
  addRows();
}

function queueMove(direction) {
  const finalPosition = calculateFinalPosition({ rowIndex: position.currentRow, tileIndex: position.currentTile }, [...movesQueue, direction]);
  if (finalPosition.rowIndex === -1 || finalPosition.tileIndex === minTileIndex - 1 || finalPosition.tileIndex === maxTileIndex + 1) return;
  const finalRow = metadata[finalPosition.rowIndex - 1];
  if (finalRow?.type === "forest" && finalRow.trees.some((tree) => tree.tileIndex === finalPosition.tileIndex)) return;
  movesQueue.push(direction);
}

function calculateFinalPosition(currentPosition, moves) {
  return moves.reduce((pos, dir) => {
    if (dir === "forward") pos.rowIndex++;
    if (dir === "backward") pos.rowIndex--;
    if (dir === "left") pos.tileIndex--;
    if (dir === "right") pos.tileIndex++;
    return pos;
  }, { ...currentPosition });
}

const moveClock = new THREE.Clock(false);
const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  metadata.forEach((rowData) => {
    if (rowData.vehicles) {
      rowData.vehicles.forEach(({ ref }) => {
        if (!ref) return;
        const beginningOfRow = (minTileIndex - 2) * tileSize;
        const endOfRow = (maxTileIndex + 2) * tileSize;
        if (rowData.direction) {
          ref.position.x = ref.position.x > endOfRow ? beginningOfRow : ref.position.x + rowData.speed * delta;
        } else {
          ref.position.x = ref.position.x < beginningOfRow ? endOfRow : ref.position.x - rowData.speed * delta;
        }
      });
    }
  });

  if (movesQueue.length) {
    if (!moveClock.running) moveClock.start();
    const progress = Math.min(1, moveClock.getElapsedTime() / 0.2);
    const startX = position.currentTile * tileSize;
    const startY = position.currentRow * tileSize;
    let endX = startX, endY = startY, endRot = 0;
    if (movesQueue[0] === "left") { endX -= tileSize; endRot = Math.PI/2; }
    if (movesQueue[0] === "right") { endX += tileSize; endRot = -Math.PI/2; }
    if (movesQueue[0] === "forward") { endY += tileSize; endRot = 0; }
    if (movesQueue[0] === "backward") { endY -= tileSize; endRot = Math.PI; }

    player.position.x = THREE.MathUtils.lerp(startX, endX, progress);
    player.position.y = THREE.MathUtils.lerp(startY, endY, progress);
    player.children[0].position.z = Math.sin(progress * Math.PI) * 8;
    player.children[0].rotation.z = endRot;

    if (progress >= 1) {
      const direction = movesQueue.shift();
      if (direction === "forward") position.currentRow++;
      if (direction === "backward") position.currentRow--;
      if (direction === "left") position.currentTile--;
      if (direction === "right") position.currentTile++;
      if (position.currentRow > metadata.length - 10) addRows();
      document.getElementById("score").innerText = position.currentRow.toString();
      moveClock.stop();
    }
  }

  const row = metadata[position.currentRow - 1];
  if (row?.vehicles) {
    const playerBox = new THREE.Box3().setFromObject(player);
    row.vehicles.forEach(({ ref }) => {
      if (ref && playerBox.intersectsBox(new THREE.Box3().setFromObject(ref))) {
        document.getElementById("result-container").style.visibility = "visible";
        document.getElementById("final-score").innerText = position.currentRow;
      }
    });
  }

  renderer.render(scene, camera);
}

const scene = new THREE.Scene();
scene.add(player);
scene.add(map);
scene.add(new THREE.AmbientLight());
const dirLight = DirectionalLight();
dirLight.target = player;
player.add(dirLight);
const camera = Camera();
player.add(camera);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas: document.querySelector("canvas.game") });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setAnimationLoop(animate);

function initializeGame() {
  position.currentRow = 0; position.currentTile = 0;
  movesQueue.length = 0;
  player.position.set(0,0,0);
  player.children[0].position.z = 0;
  initializeMap();
  document.getElementById("score").innerText = "0";
  document.getElementById("result-container").style.visibility = "hidden";
}

// WASD INPUT ONLY
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "w") { event.preventDefault(); queueMove("forward"); }
  else if (key === "s") { event.preventDefault(); queueMove("backward"); }
  else if (key === "a") { event.preventDefault(); queueMove("left"); }
  else if (key === "d") { event.preventDefault(); queueMove("right"); }
});

document.getElementById("forward").onclick = () => queueMove("forward");
document.getElementById("backward").onclick = () => queueMove("backward");
document.getElementById("left").onclick = () => queueMove("left");
document.getElementById("right").onclick = () => queueMove("right");
document.getElementById("retry").onclick = initializeGame;

initializeGame();