import Phaser from 'phaser';

const PLACES = [
  { name: 'อาคารเรียน', icon: '🏫', x: 800, y: 205, w: 360, h: 170, roof: 0xb65435, wall: 0xf0d8a7, description: 'ห้องเรียน รายวิชา และกิจกรรมการเรียนรู้' },
  { name: 'ห้องวิทยาศาสตร์', icon: '🧪', x: 270, y: 330, w: 245, h: 135, roof: 0x346d87, wall: 0xe6d4ae, description: 'การทดลองวิทยาศาสตร์และกิจกรรม STEM' },
  { name: 'ห้องสมุด', icon: '📚', x: 1270, y: 320, w: 245, h: 135, roof: 0x397c6b, wall: 0xead7ae, description: 'หนังสือ บทเรียน และคลังใบงาน' },
  { name: 'กระดานภารกิจ', icon: '📜', x: 500, y: 565, w: 180, h: 105, roof: 0x8a603d, wall: 0x9a6a45, description: 'ดูภารกิจประจำวันและกิจกรรมของโรงเรียน' },
  { name: 'ร้านค้าชุมชน', icon: '🛒', x: 1120, y: 565, w: 230, h: 125, roof: 0xc85f36, wall: 0xe6b06b, description: 'ร้านแลกเหรียญ ไอเทม และของสะสม' },
  { name: 'ศาลากลางหมู่บ้าน', icon: '🏡', x: 250, y: 650, w: 225, h: 120, roof: 0x875437, wall: 0xc89258, description: 'พื้นที่ประชุม ทำงานกลุ่ม และกิจกรรมชุมชน' },
];

const COLLECTIBLES = [{ x: 620, y: 445 }, { x: 985, y: 650 }, { x: 470, y: 760 }];

class MainTown extends Phaser.Scene {
  constructor(callbacks) {
    super('MainTown');
    this.callbacks = callbacks;
  }

  create() {
    this.physics.world.setBounds(0, 0, 1600, 900);
    this.cameras.main.setBounds(0, 0, 1600, 900);
    this.blockers = this.physics.add.staticGroup();
    this.drawWorld();
    this.createPlaces();
    this.createNpc();
    this.createCollectibles();
    this.createPlayer();
    this.physics.add.collider(this.player, this.blockers);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E,SHIFT');
    this.prompt = this.add.text(640, 654, '', {
      fontFamily: 'Tahoma', fontSize: '21px', color: '#fff',
      backgroundColor: '#332417', padding: { x: 18, y: 10 },
      stroke: '#f0bd58', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);
  }

  addBlocker(x, y, w, h) {
    const zone = this.add.zone(x, y, w, h);
    this.physics.add.existing(zone, true);
    this.blockers.add(zone);
  }

  drawWorld() {
    this.add.rectangle(800, 450, 1600, 900, 0x9bd7ec);
    this.add.rectangle(800, 165, 1600, 250, 0xb8e4f2);
    this.add.triangle(180, 235, -230, 125, 0, -90, 230, 125, 0x5e8f69).setAlpha(0.8);
    this.add.triangle(520, 235, -250, 125, 0, -105, 250, 125, 0x6e9e73).setAlpha(0.8);
    this.add.triangle(1370, 235, -280, 135, 0, -115, 280, 135, 0x5d8665).setAlpha(0.8);

    for (let i = 0; i < 9; i += 1) {
      const cloud = this.add.container(90 + i * 190, 75 + (i % 3) * 32);
      cloud.add([
        this.add.ellipse(0, 0, 110, 34, 0xffffff, 0.78),
        this.add.circle(-33, -8, 22, 0xffffff, 0.78),
        this.add.circle(22, -12, 28, 0xffffff, 0.78),
      ]);
      this.tweens.add({ targets: cloud, x: cloud.x + 90, duration: 12000 + i * 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    this.add.rectangle(800, 645, 1600, 510, 0x78bd61);
    for (let i = 0; i < 22; i += 1) {
      this.add.rectangle(20 + i * 76, 420 + (i % 2) * 12, 54, 160, i % 2 ? 0x93c84e : 0xa7d35e).setAlpha(0.45);
    }

    const road = this.add.graphics();
    road.fillStyle(0xd7b77a, 1);
    road.fillRoundedRect(690, 315, 220, 580, 70);
    road.fillRoundedRect(260, 525, 1080, 170, 70);
    road.lineStyle(3, 0xb5915e, 0.55);
    for (let y = 340; y < 870; y += 42) road.lineBetween(720, y, 880, y + 4);

    this.add.ellipse(1370, 720, 390, 250, 0x3c92b7).setStrokeStyle(14, 0x467f55);
    this.add.ellipse(1370, 715, 330, 200, 0x62bdd5);
    for (let i = 0; i < 12; i += 1) {
      this.add.ellipse(1240 + (i * 47) % 270, 660 + (i * 37) % 120, 28, 12, 0x4f9a50).setAngle((i % 3) * 25);
    }
    this.add.text(1365, 818, 'หนองน้ำ', { fontFamily: 'Tahoma', fontSize: '20px', color: '#fff', backgroundColor: '#2c4f3f', padding: { x: 10, y: 5 } }).setOrigin(0.5);
    this.addBlocker(1370, 720, 390, 250);

    this.drawFlag(800, 430);
    this.drawTrees();
    this.drawDecorations();
  }

  drawFlag(x, y) {
    this.add.ellipse(x, y + 80, 115, 36, 0x5a8a45, 0.7);
    this.add.rectangle(x, y, 10, 210, 0x6b6b6b);
    this.add.rectangle(x + 42, y - 78, 78, 18, 0xd83438).setOrigin(0.5);
    this.add.rectangle(x + 42, y - 60, 78, 12, 0xffffff).setOrigin(0.5);
    this.add.rectangle(x + 42, y - 45, 78, 18, 0x3152a4).setOrigin(0.5);
  }

  drawTree(x, y, scale = 1) {
    this.add.ellipse(x, y + 36 * scale, 56 * scale, 22 * scale, 0x3b6f36, 0.35).setDepth(2);
    this.add.rectangle(x, y + 8 * scale, 15 * scale, 62 * scale, 0x765033).setDepth(3);
    this.add.circle(x, y - 32 * scale, 38 * scale, 0x2f7e43).setDepth(4);
    this.add.circle(x - 27 * scale, y - 18 * scale, 29 * scale, 0x449b50).setDepth(4);
    this.add.circle(x + 27 * scale, y - 17 * scale, 30 * scale, 0x3d9149).setDepth(4);
    this.add.circle(x, y - 55 * scale, 28 * scale, 0x58a95a).setDepth(5);
    this.addBlocker(x, y + 10 * scale, 55 * scale, 65 * scale);
  }

  drawTrees() {
    [[90,410,1.1],[180,455,0.9],[370,410,1],[1450,410,1.15],[1510,520,0.9],[70,720,1.1],[350,790,0.9],[1050,805,1],[1510,830,1]].forEach((tree) => this.drawTree(...tree));
  }

  drawDecorations() {
    for (let i = 0; i < 18; i += 1) {
      const x = 340 + (i * 83) % 900;
      const y = 410 + (i * 57) % 360;
      this.add.circle(x, y, 5, [0xf3d35c, 0xee7a72, 0xffffff, 0xb985d8][i % 4]).setDepth(3);
    }
    for (let i = 0; i < 6; i += 1) {
      const x = 585 + i * 92;
      this.add.rectangle(x, 850, 55, 12, 0x754c2d).setDepth(7);
      this.add.rectangle(x - 20, 867, 8, 30, 0x6a472e).setDepth(7);
      this.add.rectangle(x + 20, 867, 8, 30, 0x6a472e).setDepth(7);
    }
  }

  drawBuilding(place) {
    const { x, y, w, h, roof, wall } = place;
    this.add.ellipse(x, y + h * 0.52, w * 0.94, 34, 0x244a2d, 0.24).setDepth(4);
    this.add.rectangle(x, y, w, h, wall).setStrokeStyle(5, 0x553c29).setDepth(8);
    this.add.triangle(x, y - h * 0.72, -w * 0.58, h * 0.55, 0, -h * 0.18, w * 0.58, h * 0.55, roof).setStrokeStyle(5, 0x543723).setDepth(9);
    this.add.rectangle(x, y + h * 0.22, w * 0.16, h * 0.56, 0x69472f).setStrokeStyle(3, 0x47301f).setDepth(10);
    const windows = w > 300 ? 4 : 2;
    for (let i = 0; i < windows; i += 1) {
      const wx = x - w * 0.36 + i * (w * 0.72 / (windows - 1 || 1));
      this.add.rectangle(wx, y - 5, 42, 38, 0x70b5c8).setStrokeStyle(4, 0x65432a).setDepth(10);
      this.add.line(0, 0, wx, y - 24, wx, y + 14, 0xf8e6b5).setLineWidth(2).setDepth(11);
    }
    this.add.text(x, y - h * 0.72, place.icon, { fontSize: w > 300 ? '40px' : '32px' }).setOrigin(0.5).setDepth(12);
    this.add.text(x, y + h * 0.68, place.name, { fontFamily: 'Tahoma', fontSize: '19px', color: '#fff4cf', backgroundColor: '#342519', padding: { x: 11, y: 6 }, stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setDepth(13);
    const zone = this.add.zone(x, y + 10, w * 0.92, h * 0.82).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => this.callbacks.onPlace(place));
    this.addBlocker(x, y, w * 0.88, h * 0.72);
  }

  createPlaces() {
    PLACES.forEach((place) => this.drawBuilding(place));
    this.placeZones = PLACES;
  }

  createNpc() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x5d3d24).fillEllipse(28, 14, 42, 26);
    g.fillStyle(0xffd0a8).fillCircle(28, 27, 15);
    g.fillStyle(0x2e6d43).fillRoundedRect(10, 43, 36, 34, 7);
    g.fillStyle(0x6b4930).fillRect(14, 72, 11, 20).fillRect(31, 72, 11, 20);
    g.generateTexture('npc', 56, 94);
    this.npc = this.physics.add.staticSprite(800, 555, 'npc').setDepth(40).setInteractive({ useHandCursor: true });
    this.add.text(800, 495, 'ครูภูมิปัญญา', { fontFamily: 'Tahoma', fontSize: '18px', color: '#fff8dd', backgroundColor: '#3d2b1e', padding: { x: 9, y: 5 } }).setOrigin(0.5).setDepth(45);
    const mark = this.add.text(800, 520, '!', { fontFamily: 'Tahoma', fontSize: '34px', color: '#ffd94f', stroke: '#493725', strokeThickness: 6 }).setOrigin(0.5).setDepth(46);
    this.tweens.add({ targets: mark, y: 512, duration: 650, yoyo: true, repeat: -1 });
    this.npc.on('pointerdown', () => this.callbacks.onNpc());
  }

  createCollectibles() {
    this.collectibles = this.physics.add.group();
    COLLECTIBLES.forEach(({ x, y }) => {
      const plant = this.add.container(x, y).setDepth(22);
      const glow = this.add.circle(0, 5, 27, 0xf6e47c, 0.28);
      const stem = this.add.rectangle(0, 9, 5, 25, 0x356f39);
      const leaf1 = this.add.ellipse(-10, 0, 21, 11, 0x55a744).setAngle(25);
      const leaf2 = this.add.ellipse(10, -4, 21, 11, 0x75c45b).setAngle(-25);
      plant.add([glow, stem, leaf1, leaf2]);
      this.physics.add.existing(plant);
      plant.body.setCircle(24, -24, -18);
      this.collectibles.add(plant);
      this.tweens.add({ targets: plant, y: y - 9, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
  }

  createPlayer() {
    const girl = this.callbacks.player?.character === 'girl';
    const g = this.make.graphics({ add: false });
    g.fillStyle(girl ? 0x6d3f31 : 0x23323e).fillCircle(28, 17, 18);
    g.fillStyle(0xffd2ae).fillCircle(28, 29, 15);
    g.fillStyle(0xffffff).fillRoundedRect(11, 46, 34, 34, 7);
    g.fillStyle(girl ? 0x233d70 : 0x704b2d).fillRect(11, 72, 34, 22);
    g.fillStyle(0x2d241f).fillRect(12, 91, 13, 8).fillRect(31, 91, 13, 8);
    g.generateTexture('player', 56, 102);
    this.player = this.physics.add.sprite(800, 790, 'player').setDepth(60).setCollideWorldBounds(true);
    this.player.body.setSize(32, 48).setOffset(12, 49);
    this.physics.add.overlap(this.player, this.collectibles, (_, item) => {
      item.destroy();
      this.callbacks.onCollect();
    });
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.04);
  }

  update() {
    const speed = this.keys.SHIFT.isDown ? 330 : 235;
    let x = 0; let y = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) x = -speed;
    if (this.cursors.right.isDown || this.keys.D.isDown) x = speed;
    if (this.cursors.up.isDown || this.keys.W.isDown) y = -speed;
    if (this.cursors.down.isDown || this.keys.S.isDown) y = speed;
    if (x && y) { x *= 0.707; y *= 0.707; }
    this.player.setVelocity(x, y);
    if (x !== 0) this.player.setFlipX(x < 0);
    if (x || y) this.player.setAngle(Math.sin(this.time.now / 90) * 1.4);
    else this.player.setAngle(0);

    const npcDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npc.x, this.npc.y);
    let nearest = null; let distance = Infinity;
    this.placeZones.forEach((place) => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, place.x, place.y);
      if (d < distance) { nearest = place; distance = d; }
    });

    if (npcDistance < 135) {
      this.interaction = { type: 'npc' };
      this.prompt.setText('กด E เพื่อคุยกับครูภูมิปัญญา').setVisible(true);
    } else if (distance < 190) {
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
    render: { antialias: true, pixelArt: false },
    scene: [new MainTown(callbacks)],
  });
}
