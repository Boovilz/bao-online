import Phaser from 'phaser';

const PLACES = [
  { name: 'Academy', icon: '🏫', x: 800, y: 270, color: 0x6ca7d8, description: 'ห้องเรียน รายวิชา และภารกิจการเรียนรู้' },
  { name: 'Quest Board', icon: '📜', x: 520, y: 570, color: 0xc9904d, description: 'ภารกิจประจำวัน รายสัปดาห์ และกิจกรรมพิเศษ' },
  { name: 'School Market', icon: '🛒', x: 1110, y: 520, color: 0xe78376, description: 'ร้านแลกเหรียญ ชุด และไอเทมสะสม' },
  { name: 'Library', icon: '📚', x: 1260, y: 300, color: 0xa889d8, description: 'บทเรียน หนังสือ วิดีโอ และคลังใบงาน' },
  { name: 'Science Lab', icon: '🧪', x: 300, y: 330, color: 0x70bd93, description: 'การทดลองวิทยาศาสตร์และกิจกรรม STEM' },
  { name: 'Guild Hall', icon: '🏰', x: 260, y: 610, color: 0xd7a861, description: 'สมาชิกกิลด์ คะแนนกลุ่ม และภารกิจร่วมกัน' },
];

class MainTown extends Phaser.Scene {
  constructor(onEnter) {
    super('MainTown');
    this.onEnter = onEnter;
  }

  create() {
    this.physics.world.setBounds(0, 0, 1600, 900);
    this.cameras.main.setBounds(0, 0, 1600, 900);
    this.drawWorld();
    this.createPlayer();
    this.createPlaces();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');
    this.prompt = this.add.text(640, 650, '', {
      fontFamily: 'Tahoma', fontSize: '22px', color: '#fff',
      backgroundColor: '#173b57', padding: { x: 16, y: 10 },
      stroke: '#f3c75b', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setVisible(false);
  }

  drawWorld() {
    this.add.rectangle(800, 450, 1600, 900, 0x92d7f2);
    for (let i = 0; i < 12; i += 1) {
      const cloud = this.add.ellipse(100 + i * 150, 80 + (i % 3) * 45, 150, 42, 0xffffff, 0.75);
      this.tweens.add({ targets: cloud, x: cloud.x + 70, duration: 9000 + i * 400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    this.add.rectangle(800, 660, 1600, 480, 0x79c66e);
    this.add.rectangle(800, 655, 820, 115, 0xe8d39c).setAngle(-2);
    this.add.ellipse(800, 610, 260, 150, 0x66bde2);
    this.add.ellipse(800, 610, 210, 110, 0xa6e6f5);
    this.add.circle(800, 590, 45, 0xf1c75b);
    for (let i = 0; i < 30; i += 1) {
      const x = 45 + (i * 113) % 1510;
      const y = 470 + (i * 67) % 380;
      this.add.circle(x, y, 20, 0x3f9655).setDepth(1);
      this.add.rectangle(x, y + 30, 10, 42, 0x7d5537).setDepth(0);
    }
  }

  createPlayer() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x223c58).fillCircle(22, 15, 14);
    g.fillStyle(0xffd4b5).fillCircle(22, 23, 12);
    g.fillStyle(0xffffff).fillRoundedRect(10, 35, 24, 27, 6);
    g.fillStyle(0x244b79).fillRect(10, 56, 10, 18).fillRect(24, 56, 10, 18);
    g.generateTexture('player', 44, 78);
    this.player = this.physics.add.sprite(800, 740, 'player').setDepth(30).setCollideWorldBounds(true);
    this.player.body.setSize(26, 44).setOffset(9, 30);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
  }

  createPlaces() {
    this.placeZones = PLACES.map((place) => {
      const body = this.add.rectangle(place.x, place.y, 190, 125, place.color).setStrokeStyle(6, 0x274b65).setDepth(5);
      this.add.triangle(place.x, place.y - 105, -110, 70, 0, -10, 110, 70, Phaser.Display.Color.ValueToColor(place.color).darken(18).color).setDepth(4);
      this.add.rectangle(place.x, place.y + 30, 45, 70, 0x5b3c2b).setDepth(6);
      this.add.text(place.x, place.y - 12, place.icon, { fontSize: '40px' }).setOrigin(0.5).setDepth(7);
      this.add.text(place.x, place.y + 85, place.name, { fontFamily: 'Tahoma', fontSize: '20px', color: '#fff', backgroundColor: '#183c58', padding: { x: 9, y: 5 } }).setOrigin(0.5).setDepth(8);
      body.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.onEnter(place));
      return place;
    });
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

    let nearest = null; let distance = Infinity;
    this.placeZones.forEach((place) => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, place.x, place.y);
      if (d < distance) { nearest = place; distance = d; }
    });
    this.nearest = distance < 175 ? nearest : null;
    this.prompt.setVisible(Boolean(this.nearest));
    if (this.nearest) this.prompt.setText(`กด E เพื่อเข้า ${this.nearest.name}`);
    if (this.nearest && Phaser.Input.Keyboard.JustDown(this.keys.E)) this.onEnter(this.nearest);
  }
}

export function createGame(parent, onEnter) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: '#102a43',
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [new MainTown(onEnter)],
  });
}
