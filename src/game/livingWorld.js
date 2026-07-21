import Phaser from 'phaser';

const NPC_DEFINITIONS = [
  { name: 'น้องอิม', role: 'student-girl', shirt: 0xf4a7c1, skin: 0xf2c49d, hair: 0x33251f, badge: 0xffd54f, emote: '😊', route: [{ x: 720, y: 610 }, { x: 930, y: 610 }, { x: 1110, y: 700 }, { x: 930, y: 610 }] },
  { name: 'น้องฟิว', role: 'student-boy', shirt: 0x6fa8dc, skin: 0xe8b98f, hair: 0x2b211e, badge: 0x8fd3ff, emote: '⚽', route: [{ x: 1070, y: 590 }, { x: 1260, y: 590 }, { x: 1380, y: 720 }, { x: 1260, y: 590 }] },
  { name: 'น้ำมนต์', role: 'student-girl', shirt: 0x9b7ad6, skin: 0xf1c7a5, hair: 0x3b281f, badge: 0xffb6d5, emote: '📚', route: [{ x: 520, y: 780 }, { x: 720, y: 780 }, { x: 850, y: 650 }, { x: 720, y: 780 }] },
  { name: 'น้องมิน', role: 'student-girl', shirt: 0x56b9b0, skin: 0xf0c39c, hair: 0x2d211d, badge: 0xa9f0df, emote: '🧪', route: [{ x: 870, y: 850 }, { x: 1060, y: 850 }, { x: 1170, y: 750 }, { x: 1060, y: 850 }] },
  { name: 'ออฟตัน', role: 'student-boy', shirt: 0xf1a45b, skin: 0xe9b88d, hair: 0x36251e, badge: 0xffda83, emote: '🤖', route: [{ x: 420, y: 590 }, { x: 610, y: 590 }, { x: 650, y: 735 }, { x: 510, y: 735 }] },
  { name: 'การ์ตูน', role: 'student-girl', shirt: 0xe97aa8, skin: 0xf4caa8, hair: 0x4a2f25, badge: 0xffc1dc, emote: '🎨', route: [{ x: 1340, y: 830 }, { x: 1490, y: 830 }, { x: 1560, y: 930 }, { x: 1400, y: 930 }] },
  { name: 'ลุงคำ', role: 'villager', shirt: 0x63a65f, skin: 0xd9a878, hair: 0x6b5744, badge: 0xa8db7f, emote: '🌾', route: [{ x: 320, y: 690 }, { x: 500, y: 690 }, { x: 620, y: 830 }, { x: 500, y: 690 }] },
  { name: 'ป้าดาว', role: 'villager', shirt: 0xd88952, skin: 0xe0ad82, hair: 0x5a4034, badge: 0xffc785, emote: '🛒', route: [{ x: 1450, y: 640 }, { x: 1600, y: 640 }, { x: 1680, y: 810 }, { x: 1530, y: 810 }] },
];

function createPerson(scene, definition, index) {
  const start = definition.route[0];
  const container = scene.add.container(start.x, start.y).setDepth(58 + index);
  const isGirl = definition.role === 'student-girl';
  const isStudent = definition.role.startsWith('student');
  const shadow = scene.add.ellipse(0, 31, 35, 11, 0x173726, 0.3);
  const leftLeg = scene.add.rectangle(-5, 20, 8, 20, isStudent ? 0x263d59 : 0x3f4b3f).setOrigin(0.5);
  const rightLeg = scene.add.rectangle(5, 20, 8, 20, isStudent ? 0x263d59 : 0x3f4b3f).setOrigin(0.5);
  const leftShoe = scene.add.rectangle(-5, 31, 10, 5, 0x26211f);
  const rightShoe = scene.add.rectangle(5, 31, 10, 5, 0x26211f);
  const body = scene.add.rectangle(0, 2, isGirl ? 29 : 27, 31, definition.shirt).setStrokeStyle(2, 0xffffff, 0.28);
  const collarLeft = scene.add.triangle(-6, -8, -6, -5, 0, 5, 6, -5, 0xffffff, 0.95);
  const collarRight = scene.add.triangle(6, -8, -6, -5, 0, 5, 6, -5, 0xffffff, 0.95).setFlipX(true);
  const badge = scene.add.circle(8, 0, 3, definition.badge || 0xffd54f).setStrokeStyle(1, 0xffffff, 0.8);
  const head = scene.add.circle(0, -22, 12, definition.skin).setStrokeStyle(1, 0xb5795e, 0.45);
  const hair = scene.add.arc(0, -26, 12.5, 180, 360, false, definition.hair || 0x3a2a22);
  const fringe = scene.add.triangle(-3, -28, -10, 1, 0, 7, 8, 0, definition.hair || 0x3a2a22).setAngle(-8);
  const eyeLeft = scene.add.circle(-4, -21, 1.4, 0x2c2622);
  const eyeRight = scene.add.circle(4, -21, 1.4, 0x2c2622);
  const online = scene.add.circle(14, -36, 3.5, 0x55e68a).setStrokeStyle(1, 0xffffff);
  container.add([shadow, leftLeg, rightLeg, leftShoe, rightShoe, body, collarLeft, collarRight, badge, head, hair, fringe, eyeLeft, eyeRight, online]);
  const label = scene.add.text(0, -52, definition.name, { fontFamily: 'Tahoma', fontSize: '13px', color: '#fff9df', backgroundColor: '#3c2c20', padding: { x: 6, y: 3 }, stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
  const emote = scene.add.text(0, -78, definition.emote || '😊', { fontSize: '20px' }).setOrigin(0.5).setAlpha(0);
  container.add([label, emote]);
  container.setData('routeIndex', 0);
  container.setData('definition', definition);
  container.setData('parts', { shadow, leftLeg, rightLeg, body, head, hair });
  container.setData('label', label);
  container.setData('emote', emote);
  return container;
}

function showEmote(scene, npc) {
  const emote = npc.getData('emote');
  if (!emote || !npc.active) return;
  emote.setAlpha(1).setScale(0.65).setY(-70);
  scene.tweens.add({ targets: emote, y: -84, scale: 1, alpha: 0, duration: 1100, ease: 'Back.Out' });
}

function walkNext(scene, npc) {
  if (!npc.active || !scene.sys.isActive()) return;
  const definition = npc.getData('definition');
  const currentIndex = npc.getData('routeIndex');
  const nextIndex = (currentIndex + 1) % definition.route.length;
  const target = definition.route[nextIndex];
  const distance = Phaser.Math.Distance.Between(npc.x, npc.y, target.x, target.y);
  const duration = Math.max(1050, distance * 6.1);
  const parts = npc.getData('parts');
  const label = npc.getData('label');
  if (Math.abs(target.x - npc.x) > 5) {
    npc.setScale(target.x < npc.x ? -1 : 1, 1);
    label.setScale(npc.scaleX < 0 ? -1 : 1, 1);
    npc.getData('emote').setScale(npc.scaleX < 0 ? -1 : 1, 1);
  }
  scene.tweens.add({
    targets: npc, x: target.x, y: target.y, duration, ease: 'Sine.inOut',
    onUpdate: () => {
      const step = Math.sin(scene.time.now / 80) * 3.2;
      parts.leftLeg.y = 20 + step;
      parts.rightLeg.y = 20 - step;
      parts.body.y = 2 - Math.abs(step) * 0.3;
      parts.shadow.scaleX = 1 - Math.abs(step) * 0.018;
    },
    onComplete: () => {
      npc.setData('routeIndex', nextIndex);
      parts.leftLeg.y = 20;
      parts.rightLeg.y = 20;
      parts.body.y = 2;
      parts.shadow.scaleX = 1;
      scene.tweens.add({ targets: [parts.body, parts.head, parts.hair], y: '-=1.4', duration: 420, yoyo: true, repeat: 1, ease: 'Sine.inOut' });
      if (Phaser.Math.Between(0, 3) === 0) showEmote(scene, npc);
      scene.time.delayedCall(Phaser.Math.Between(650, 1700), () => walkNext(scene, npc));
    },
  });
}

function createClock(scene) {
  const panel = scene.add.container(1160, 66).setScrollFactor(0).setDepth(420);
  const background = scene.add.rectangle(0, 0, 190, 62, 0x173a36, 0.92).setStrokeStyle(2, 0xf0bd58, 0.8);
  const title = scene.add.text(0, -13, 'เวลาในหมู่บ้าน', { fontFamily: 'Tahoma', fontSize: '13px', color: '#ffe7a3' }).setOrigin(0.5);
  const timeText = scene.add.text(0, 12, '08:00 น.', { fontFamily: 'Tahoma', fontSize: '21px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
  panel.add([background, title, timeText]);
  return timeText;
}

function initializeLivingWorld(scene) {
  scene.__livingWorldInitialized = true;
  scene.__villageMinutes = 8 * 60;
  scene.__dayOverlay = scene.add.rectangle(640, 360, 1280, 720, 0x19335f, 0).setScrollFactor(0).setDepth(250).setBlendMode(Phaser.BlendModes.MULTIPLY);
  scene.__clockText = createClock(scene);
  scene.__livingNpcs = NPC_DEFINITIONS.map((definition, index) => createPerson(scene, definition, index));
  scene.__livingNpcs.forEach((npc, index) => scene.time.delayedCall(350 + index * 240, () => walkNext(scene, npc)));
  scene.add.text(18, 18, 'PHASE 9.2 • CHARACTER REMASTER', { fontFamily: 'Tahoma', fontSize: '14px', color: '#fff4c8', backgroundColor: '#285247', padding: { x: 9, y: 6 } }).setScrollFactor(0).setDepth(420);
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
