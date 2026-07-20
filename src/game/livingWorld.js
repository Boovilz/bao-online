import Phaser from 'phaser';

const NPC_DEFINITIONS = [
  {
    name: 'น้องอิม', role: 'student-girl', shirt: 0xf4a7c1, skin: 0xf2c49d, hair: 0x30221d,
    route: [{ x: 720, y: 610 }, { x: 930, y: 610 }, { x: 1110, y: 700 }, { x: 930, y: 610 }],
  },
  {
    name: 'น้องฟิว', role: 'student-boy', shirt: 0x6fa8dc, skin: 0xe8b98f, hair: 0x2c211d,
    route: [{ x: 1070, y: 590 }, { x: 1260, y: 590 }, { x: 1380, y: 720 }, { x: 1260, y: 590 }],
  },
  {
    name: 'น้ำมนต์', role: 'student-girl', shirt: 0x9b7ad6, skin: 0xf1c7a5, hair: 0x3b271f,
    route: [{ x: 520, y: 780 }, { x: 720, y: 780 }, { x: 850, y: 650 }, { x: 720, y: 780 }],
  },
  {
    name: 'ลุงคำ', role: 'villager', shirt: 0x63a65f, skin: 0xd9a878, hair: 0x655043,
    route: [{ x: 320, y: 690 }, { x: 500, y: 690 }, { x: 620, y: 830 }, { x: 500, y: 690 }],
  },
  {
    name: 'ป้าดาว', role: 'villager', shirt: 0xd88952, skin: 0xe0ad82, hair: 0x594036,
    route: [{ x: 1450, y: 640 }, { x: 1600, y: 640 }, { x: 1680, y: 810 }, { x: 1530, y: 810 }],
  },
  {
    name: 'น้องมิน', role: 'student-girl', shirt: 0x56b9b0, skin: 0xf0c39c, hair: 0x2f241f,
    route: [{ x: 870, y: 850 }, { x: 1060, y: 850 }, { x: 1170, y: 750 }, { x: 1060, y: 850 }],
  },
];

function addRoundedBody(scene, x, y, width, height, radius, color) {
  if (scene.add.roundedRect) return scene.add.roundedRect(x, y, width, height, radius, color);
  return scene.add.rectangle(x, y, width, height, color);
}

function createPerson(scene, definition, index) {
  const start = definition.route[0];
  const container = scene.add.container(start.x, start.y).setDepth(58 + index);
  const isStudent = definition.role.startsWith('student');
  const isGirl = definition.role === 'student-girl';

  const shadow = scene.add.ellipse(0, 31, 37, 11, 0x173726, 0.3);
  const leftLeg = scene.add.rectangle(-5, 20, 8, 20, isStudent ? 0x243b58 : 0x3d4b4c).setOrigin(0.5);
  const rightLeg = scene.add.rectangle(5, 20, 8, 20, isStudent ? 0x243b58 : 0x3d4b4c).setOrigin(0.5);
  const leftShoe = scene.add.ellipse(-5, 30, 11, 6, 0x2a211d);
  const rightShoe = scene.add.ellipse(5, 30, 11, 6, 0x2a211d);
  const body = addRoundedBody(scene, 0, 2, 30, 32, 7, definition.shirt);
  const collarLeft = scene.add.triangle(-6, -8, -6, -5, 0, 4, 6, -5, 0xffffff, 0.92);
  const collarRight = scene.add.triangle(6, -8, -6, -5, 0, 4, 6, -5, 0xffffff, 0.92).setFlipX(true);
  const badge = scene.add.circle(9, 1, 3, isStudent ? 0xffd35a : 0xf2e1b2).setStrokeStyle(1, 0x5b462f);
  const head = scene.add.circle(0, -22, 13, definition.skin).setStrokeStyle(1, 0x9f7558, 0.45);
  const hair = scene.add.arc(0, -26, 13, 180, 360, false, definition.hair);
  const fringe = scene.add.rectangle(0, -31, isGirl ? 21 : 17, 6, definition.hair).setAngle(isGirl ? -3 : 3);
  const eyeLeft = scene.add.circle(-4, -21, 1.5, 0x2c2622);
  const eyeRight = scene.add.circle(4, -21, 1.5, 0x2c2622);
  const smile = scene.add.arc(0, -17, 4, 20, 160, false, 0x7d493d).setStrokeStyle(1, 0x7d493d);

  container.add([
    shadow, leftLeg, rightLeg, leftShoe, rightShoe, body,
    collarLeft, collarRight, badge, head, hair, fringe, eyeLeft, eyeRight, smile,
  ]);

  if (isGirl) {
    const ponyLeft = scene.add.circle(-13, -27, 5, definition.hair);
    const ponyRight = scene.add.circle(13, -27, 5, definition.hair);
    container.add([ponyLeft, ponyRight]);
  }

  const label = scene.add.text(0, -53, definition.name, {
    fontFamily: 'Tahoma', fontSize: '13px', color: '#fff9df',
    backgroundColor: '#3c2c20', padding: { x: 6, y: 3 },
    stroke: '#1f1712', strokeThickness: 2,
  }).setOrigin(0.5);
  container.add(label);

  const status = scene.add.circle(17, -43, 4, 0x68d391).setStrokeStyle(2, 0xffffff, 0.9);
  container.add(status);

  container.setData('routeIndex', 0);
  container.setData('definition', definition);
  container.setData('leftLeg', leftLeg);
  container.setData('rightLeg', rightLeg);
  container.setData('body', body);
  container.setData('label', label);
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
  const label = npc.getData('label');
  if (label) label.setScale(npc.scaleX < 0 ? -1 : 1, 1);

  scene.tweens.add({
    targets: npc,
    x: target.x,
    y: target.y,
    duration,
    ease: 'Sine.inOut',
    onUpdate: () => {
      const step = Math.sin(scene.time.now / 90) * 2.4;
      npc.getData('leftLeg').y = 20 + step;
      npc.getData('rightLeg').y = 20 - step;
      npc.getData('body').y = 2 - Math.abs(step) * 0.28;
    },
    onComplete: () => {
      npc.setData('routeIndex', nextIndex);
      npc.getData('leftLeg').y = 20;
      npc.getData('rightLeg').y = 20;
      npc.getData('body').y = 2;
      scene.tweens.add({ targets: npc, y: npc.y - 2, duration: 450, yoyo: true, repeat: 1 });
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

  scene.add.text(18, 18, 'PHASE 9.2 • CHARACTER REMASTER', {
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
