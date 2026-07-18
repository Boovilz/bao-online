import Phaser from 'phaser';

const NPC_DEFINITIONS = [
  {
    name: 'น้องอิม', role: 'student', shirt: 0xf4a7c1, skin: 0xf2c49d,
    route: [{ x: 720, y: 610 }, { x: 930, y: 610 }, { x: 1110, y: 700 }, { x: 930, y: 610 }],
  },
  {
    name: 'น้องฟิว', role: 'student', shirt: 0x6fa8dc, skin: 0xe8b98f,
    route: [{ x: 1070, y: 590 }, { x: 1260, y: 590 }, { x: 1380, y: 720 }, { x: 1260, y: 590 }],
  },
  {
    name: 'น้ำมนต์', role: 'student', shirt: 0x9b7ad6, skin: 0xf1c7a5,
    route: [{ x: 520, y: 780 }, { x: 720, y: 780 }, { x: 850, y: 650 }, { x: 720, y: 780 }],
  },
  {
    name: 'ลุงคำ', role: 'villager', shirt: 0x63a65f, skin: 0xd9a878,
    route: [{ x: 320, y: 690 }, { x: 500, y: 690 }, { x: 620, y: 830 }, { x: 500, y: 690 }],
  },
  {
    name: 'ป้าดาว', role: 'villager', shirt: 0xd88952, skin: 0xe0ad82,
    route: [{ x: 1450, y: 640 }, { x: 1600, y: 640 }, { x: 1680, y: 810 }, { x: 1530, y: 810 }],
  },
  {
    name: 'น้องมิน', role: 'student', shirt: 0x56b9b0, skin: 0xf0c39c,
    route: [{ x: 870, y: 850 }, { x: 1060, y: 850 }, { x: 1170, y: 750 }, { x: 1060, y: 850 }],
  },
];

function createPerson(scene, definition, index) {
  const start = definition.route[0];
  const container = scene.add.container(start.x, start.y).setDepth(58 + index);
  const shadow = scene.add.ellipse(0, 29, 33, 10, 0x173726, 0.28);
  const legs = scene.add.rectangle(0, 18, 18, 22, 0x31455f).setOrigin(0.5);
  const body = scene.add.roundedRect
    ? scene.add.roundedRect(0, 2, 28, 31, 7, definition.shirt)
    : scene.add.rectangle(0, 2, 28, 31, definition.shirt);
  const head = scene.add.circle(0, -21, 12, definition.skin);
  const hair = scene.add.arc(0, -25, 12, 180, 360, false, definition.role === 'student' ? 0x3a2a22 : 0x5a4434);
  const eyeLeft = scene.add.circle(-4, -20, 1.4, 0x2c2622);
  const eyeRight = scene.add.circle(4, -20, 1.4, 0x2c2622);
  container.add([shadow, legs, body, head, hair, eyeLeft, eyeRight]);

  const label = scene.add.text(0, -48, definition.name, {
    fontFamily: 'Tahoma', fontSize: '13px', color: '#fff9df',
    backgroundColor: '#3c2c20', padding: { x: 5, y: 3 },
  }).setOrigin(0.5);
  container.add(label);

  container.setData('routeIndex', 0);
  container.setData('definition', definition);
  return container;
}

function walkNext(scene, npc) {
  if (!npc.active || !scene.sys.isActive()) return;
  const definition = npc.getData('definition');
  const currentIndex = npc.getData('routeIndex');
  const nextIndex = (currentIndex + 1) % definition.route.length;
  const target = definition.route[nextIndex];
  const distance = Phaser.Math.Distance.Between(npc.x, npc.y, target.x, target.y);
  const duration = Math.max(1300, distance * 7.2);

  if (Math.abs(target.x - npc.x) > 5) npc.setScale(target.x < npc.x ? -1 : 1, 1);
  npc.list.forEach((child) => {
    if (child.type === 'Text') child.setScale(npc.scaleX < 0 ? -1 : 1, 1);
  });

  scene.tweens.add({
    targets: npc,
    x: target.x,
    y: target.y,
    duration,
    ease: 'Sine.inOut',
    onUpdate: (_tween, targetNpc) => {
      const walking = Math.sin(scene.time.now / 95) * 2;
      targetNpc.list[1].y = 18 + walking;
      targetNpc.list[2].y = 2 - Math.abs(walking) * 0.35;
    },
    onComplete: () => {
      npc.setData('routeIndex', nextIndex);
      npc.list[1].y = 18;
      npc.list[2].y = 2;
      scene.time.delayedCall(Phaser.Math.Between(900, 2400), () => walkNext(scene, npc));
    },
  });
}

function createClock(scene) {
  const panel = scene.add.container(1160, 66).setScrollFactor(0).setDepth(420);
  const background = scene.add.rectangle(0, 0, 190, 62, 0x173a36, 0.92)
    .setStrokeStyle(2, 0xf0bd58, 0.8);
  const title = scene.add.text(0, -13, 'เวลาในหมู่บ้าน', {
    fontFamily: 'Tahoma', fontSize: '13px', color: '#ffe7a3',
  }).setOrigin(0.5);
  const timeText = scene.add.text(0, 12, '08:00 น.', {
    fontFamily: 'Tahoma', fontSize: '21px', color: '#ffffff', fontStyle: 'bold',
  }).setOrigin(0.5);
  panel.add([background, title, timeText]);
  return timeText;
}

function initializeLivingWorld(scene) {
  scene.__livingWorldInitialized = true;
  scene.__villageMinutes = 8 * 60;
  scene.__dayOverlay = scene.add.rectangle(640, 360, 1280, 720, 0x19335f, 0)
    .setScrollFactor(0).setDepth(250).setBlendMode(Phaser.BlendModes.MULTIPLY);
  scene.__clockText = createClock(scene);
  scene.__livingNpcs = NPC_DEFINITIONS.map((definition, index) => createPerson(scene, definition, index));

  scene.__livingNpcs.forEach((npc, index) => {
    scene.time.delayedCall(500 + index * 380, () => walkNext(scene, npc));
  });

  scene.add.text(18, 18, 'PHASE 3 • LIVING WORLD', {
    fontFamily: 'Tahoma', fontSize: '14px', color: '#fff4c8',
    backgroundColor: '#285247', padding: { x: 9, y: 6 },
  }).setScrollFactor(0).setDepth(420);
}

function updateLivingWorld(scene, delta) {
  scene.__villageMinutes = (scene.__villageMinutes + delta * 0.0018) % 1440;
  const hour = Math.floor(scene.__villageMinutes / 60);
  const minute = Math.floor(scene.__villageMinutes % 60);
  scene.__clockText.setText(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} น.`);

  let alpha = 0;
  if (hour >= 18 || hour < 6) alpha = 0.48;
  else if (hour >= 16) alpha = (hour - 16) * 0.12;
  else if (hour < 8) alpha = (8 - hour) * 0.1;
  scene.__dayOverlay.setAlpha(Phaser.Math.Clamp(alpha, 0, 0.48));
}

const managerPrototype = Phaser.Scenes.SceneManager.prototype;
if (!managerPrototype.__baoLivingWorldPatched) {
  const originalUpdate = managerPrototype.update;
  managerPrototype.update = function patchedSceneManagerUpdate(time, delta) {
    originalUpdate.call(this, time, delta);
    this.getScenes(true).forEach((scene) => {
      if (scene.sys.settings.key !== 'MainTown' || !scene.player) return;
      if (!scene.__livingWorldInitialized) initializeLivingWorld(scene);
      updateLivingWorld(scene, delta);
    });
  };
  managerPrototype.__baoLivingWorldPatched = true;
}
