import Phaser from 'phaser';

const PLACES = [
  { name: 'อาคารเรียน', icon: '🏫', x: 800, y: 250, color: 0xb86f42, description: 'ห้องเรียน รายวิชา และกิจกรรมการเรียนรู้' },
  { name: 'กระดานภารกิจ', icon: '📜', x: 500, y: 540, color: 0x9b7045, description: 'ดูภารกิจประจำวันและกิจกรรมของโรงเรียน' },
  { name: 'ร้านค้าชุมชน', icon: '🛒', x: 1110, y: 500, color: 0xd78355, description: 'ร้านแลกเหรียญ ไอเทม และของสะสม' },
  { name: 'ห้องสมุด', icon: '📚', x: 1250, y: 290, color: 0x4f8b78, description: 'หนังสือ บทเรียน และคลังใบงาน' },
  { name: 'ห้องวิทยาศาสตร์', icon: '🧪', x: 300, y: 315, color: 0x4c7f9c, description: 'การทดลองวิทยาศาสตร์และกิจกรรม STEM' },
  { name: 'ศาลากลางหมู่บ้าน', icon: '🏡', x: 270, y: 610, color: 0x9a6b45, description: 'พื้นที่ประชุม ทำงานกลุ่ม และกิจกรรมชุมชน' },
];

const COLLECTIBLES = [
  { x: 620, y: 430 },
  { x: 955, y: 625 },
  { x: 455, y: 730 },
];

class MainTown extends Phaser.Scene {
  constructor(callbacks) {
    super('MainTown');
    this.callbacks = callbacks;
  }

  create() {
    this.physics.world.setBounds(0, 0, 1600, 900);
    this.cameras.main.setBounds(0, 0, 1600, 900);
    this.drawWorld();
    this.createPlaces();
    this.createNpc();
    this.createCollectibles();
    this.createPlayer();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');
    this.prompt = this.add.text(640, 650, '', {
      fontFamily: 'Tahoma', fontSize: '22px', color: '#fff',
      backgroundColor: '#3e2f21', padding: { x: 16, y: 10 },
      stroke: '#edc46d', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setVisible(false);
  }

  drawWorld() {
    this.add.rectangle(800, 450, 1600, 900, 0x9fd8ee);
    for (let i = 0; i < 10; i += 1) {
      const cloud = this.add.ellipse(80 + i * 175, 70 + (i % 3) * 38, 150, 40, 0xffffff, 0.72);
      this.tweens.add({ targets: cloud, x: cloud.x + 80, duration: 10000 + i * 450, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    this.add.rectangle(800, 665, 1600, 470, 0x78bd62);
    this.add.rectangle(800, 670, 760, 120, 0xd9bd7c).setAngle(-1);
    this.add.ellipse(1380, 690, 360, 260, 0x56a9ca);
    this.add.ellipse(1380, 690, 300, 210, 0x79cde0);
    this.add.rectangle(800, 448, 18, 150, 0xd5d8d6);
    this.add.rectangle(800, 370, 7, 125, 0x666666);
    this.add.rectangle(835, 392, 72, 34, 0xd52d32).setOrigin(1, 0.5);
    this.add.rectangle(835, 405, 72, 10, 0xffffff).setOrigin(1, 0.5);
    this.add.rectangle(835, 418, 72, 10, 0x2d4fa0).setOrigin(1, 0.5);

    for (let i = 0; i < 38; i += 1) {
      const x = 45 + (i * 127) % 1510;
      const y = 455 + (i * 79) % 390;
      if (Phaser.Math.Distance.Between(x, y, 800, 650) < 190) continue;
      this.add.rectangle(x, y + 26, 10, 42, 0x735036).setDepth(0);
      this.add.circle(x, y, 24, 0x3d8d4c).setDepth(1);
      this.add.circle(x - 16, y + 4, 17, 0x55a85e).setDepth(1);
    }
  }

  createPlaces() {
    this.placeZones = PLACES.map((place) => {
      const body = this.add.rectangle(place.x, place.y, 190, 125, place.color).setStrokeStyle(6, 0x493725).setDepth(5);
      this.add.triangle(place.x, place.y - 104, -110, 70, 0, -10, 110, 70, Phaser.Display.Color.ValueToColor(place.color).darken(18).color).setDepth(4);
      this.add.rectangle(place.x, place.y + 30, 45, 70, 0x5b3c2b).setDepth(6);
      this.add.text(place.x, place.y - 12, place.icon, { fontSize: '40px' }).setOrigin(0.5).setDepth(7);
      this.add.text(place.x, place.y + 86, place.name, { fontFamily: 'Tahoma', fontSize: '20px', color: '#fff', backgroundColor: '#3e2f21', padding: { x: 9, y: 5 } }).setOrigin(0.5).setDepth(8);
      body.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.callbacks.onPlace(place));
      return place;
    });
  }

  createNpc() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x80562e).fillCircle(24, 13, 16);
    g.fillStyle(0xffd1ad).fillCircle(24, 24, 13);
    g.fillStyle(0x3d7c47).fillRoundedRect(9, 37, 30, 30, 6);
    g.fillStyle(0x8b5d35).fillRect(12, 64, 10, 17).fillRect(27, 64, 10, 17);
    g.generateTexture('npc', 48, 82);
    this.npc = this.physics.add.staticSprite(800, 545, 'npc').setDepth(25).setInteractive({ useHandCursor: true });
    this.add.text(800, 490, 'ครูภูมิปัญญา', { fontFamily: 'Tahoma', fontSize: '18px', color: '#fff', backgroundColor: '#3e2f21', padding: { x: 8, y: 4 } }).setOrigin(0.5).setDepth(26);
    this.add.text(800, 520, '!', { fontFamily: 'Tahoma', fontSize: '30px', color: '#ffd94f', stroke: '#493725', strokeThickness: 5 }).setOrigin(0.5).setDepth(30);
    this.npc.on('pointerdown', () => this.callbacks.onNpc());
  }

  createCollectibles() {
    this.collectibles = this.physics.add.group();
    COLLECTIBLES.forEach(({ x, y }) => {
      const plant = this.add.container(x, y).setDepth(12);
      const glow = this.add.circle(0, 5, 24, 0xf6e47c, 0.24);
      const stem = this.add.rectangle(0, 8, 5, 24, 0x41713a);
      const leaf1 = this.add.ellipse(-9, 0, 18, 10, 0x65b44f).setAngle(25);
      const leaf2 = this.add.ellipse(9, -3, 18, 10, 0x79c95b).setAngle(-25);
      plant.add([glow, stem, leaf1, leaf2]);
      this.physics.add.existing(plant);
      plant.body.setCircle(22, -22, -17);
      this.collectibles.add(plant);
      this.tweens.add({ targets: plant, y: y - 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
  }

  createPlayer() {
    const girl = this.callbacks.player?.character === 'girl';
    const g = this.make.graphics({ add: false });
    g.fillStyle(girl ? 0x6b382a : 0x22313f).fillCircle(22, 15, 15);
    g.fillStyle(0xffd4b5).fillCircle(22, 23, 12);
    g.fillStyle(0xffffff).fillRoundedRect(10, 35, 24, 27, 6);
    g.fillStyle(girl ? 0x243f73 : 0x6f4a2e).fillRect(10, 56, 24, 18);
    g.generateTexture('player', 44, 78);
    this.player = this.physics.add.sprite(800, 760, 'player').setDepth(30).setCollideWorldBounds(true);
    this.player.body.setSize(26, 44).setOffset(9, 30);
    this.physics.add.overlap(this.player, this.collectibles, (_, item) => {
      item.destroy();
      this.callbacks.onCollect();
    });
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
  }

  update() {
    const speed = 240;
    let x = 0; let y = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) x = -speed;
    if (this.cursors.right.isDown || this.keys.D.isDown) x = speed;
    if (this.cursors.up.isDown || this.keys.W.isDown) y = -speed;
    if (this.cursors.down.isDown || this.keys.S.isDown) y = speed;
    if (x && y) { x *= 0.707; y *= 0.707; }
    this.player.setVelocity(x, y);

    const npcDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npc.x, this.npc.y);
    let nearest = null; let distance = Infinity;
    this.placeZones.forEach((place) => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, place.x, place.y);
      if (d < distance) { nearest = place; distance = d; }
    });

    if (npcDistance < 130) {
      this.interaction = { type: 'npc' };
      this.prompt.setText('กด E เพื่อคุยกับครูภูมิปัญญา').setVisible(true);
    } else if (distance < 175) {
      this.interaction = { type: 'place', place: nearest };
      this.prompt.setText(`กด E เพื่อเข้า ${nearest.name}`).setVisible(true);
    } else {
      this.interaction = null;
      this.prompt.setVisible(false);
    }

    if (this.interaction && Phaser.Input.Keyboard.JustDown(this.keys.E)) {
      if (this.interaction.type === 'npc') this.callbacks.onNpc();
      else this.callbacks.onPlace(this.interaction.place);
    }
  }
}

export function createGame(parent, callbacks) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: '#102a43',
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [new MainTown(callbacks)],
  });
}
