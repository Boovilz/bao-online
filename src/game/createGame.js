import Phaser from 'phaser';

class MainTown extends Phaser.Scene {
  constructor(callbacks) {
    super('MainTown');
    this.callbacks = callbacks;
  }

  preload() {
    this.load.json('mainTown', '/maps/main-town.json');
    this.load.svg('school', '/assets/school.svg', { width: 420, height: 250 });
    this.load.svg('village', '/assets/village-building.svg', { width: 260, height: 190 });
    this.load.svg('tree', '/assets/tree.svg', { width: 130, height: 170 });
    this.load.svg('boy', '/assets/player-boy.svg', { width: 80, height: 120 });
    this.load.svg('girl', '/assets/player-girl.svg', { width: 80, height: 120 });
    this.load.svg('teacher', '/assets/npc-teacher.svg', { width: 86, height: 126 });
  }

  create() {
    this.mapData = this.cache.json.get('mainTown');
    const { width, height } = this.mapData.world;
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);
    this.blockers = this.physics.add.staticGroup();

    this.generateTerrainTextures();
    this.createTilemap();
    this.createAmbientLife();
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
    }).setOrigin(0.5).setScrollFactor(0).setDepth(300).setVisible(false);
  }

  generateTerrainTextures() {
    const grass = this.make.graphics({ add: false });
    grass.fillStyle(0x76b85e).fillRect(0, 0, 64, 64);
    grass.fillStyle(0x8ac86d);
    [[8,12],[28,8],[51,19],[17,43],[42,50]].forEach(([x,y]) => grass.fillRect(x,y,3,8));
    grass.fillStyle(0x5c9e4c);
    [[12,22],[36,31],[55,47]].forEach(([x,y]) => grass.fillTriangle(x,y,x-4,y+8,x+4,y+8));
    grass.generateTexture('grass-tile', 64, 64);

    const path = this.make.graphics({ add: false });
    path.fillStyle(0xd4b273).fillRect(0, 0, 64, 64);
    path.fillStyle(0xb58d55);
    [[8,11,8,4],[34,18,12,5],[16,39,10,4],[47,48,9,4]].forEach(([x,y,w,h]) => path.fillRoundedRect(x,y,w,h,2));
    path.fillStyle(0xe2c58b);
    [[5,30],[29,52],[53,8]].forEach(([x,y]) => path.fillCircle(x,y,3));
    path.generateTexture('path-tile', 64, 64);

    const water = this.make.graphics({ add: false });
    water.fillStyle(0x62b8d0).fillRect(0, 0, 64, 64);
    water.lineStyle(3, 0x9edbe5, 0.9);
    water.beginPath(); water.moveTo(4,16); water.lineTo(24,16); water.lineTo(31,12); water.strokePath();
    water.beginPath(); water.moveTo(30,42); water.lineTo(52,42); water.lineTo(60,38); water.strokePath();
    water.lineStyle(2, 0x3c8dad, 0.8);
    water.beginPath(); water.moveTo(8,55); water.lineTo(28,55); water.strokePath();
    water.generateTexture('water-tile', 64, 64);
  }

  createTilemap() {
    const { width, height, tileSize } = this.mapData.world;
    this.add.rectangle(width / 2, height / 2, width, height, 0x9bd7ec);
    this.add.rectangle(width / 2, 180, width, 270, 0xc2e9f4);
    this.add.triangle(170,260,-260,135,0,-110,260,135,0x6b9870).setAlpha(0.9);
    this.add.triangle(520,260,-260,135,0,-120,260,135,0x79a477).setAlpha(0.9);
    this.add.triangle(1390,260,-300,145,0,-125,300,145,0x648b69).setAlpha(0.9);

    this.map = this.make.tilemap({ tileWidth: tileSize, tileHeight: tileSize, width: Math.ceil(width / tileSize), height: Math.ceil(height / tileSize) });
    const grassSet = this.map.addTilesetImage('grass-tile', 'grass-tile', tileSize, tileSize, 0, 0, 0);
    const pathSet = this.map.addTilesetImage('path-tile', 'path-tile', tileSize, tileSize, 0, 0, 1);
    const groundLayer = this.map.createBlankLayer('Ground', grassSet).fill(0);
    groundLayer.setDepth(1);
    this.pathLayer = this.map.createBlankLayer('Road', pathSet).fill(-1).setDepth(2);

    this.mapData.roads.forEach((road) => {
      const startX = Math.floor(road.x / tileSize);
      const startY = Math.floor(road.y / tileSize);
      const endX = Math.ceil((road.x + road.width) / tileSize);
      const endY = Math.ceil((road.y + road.height) / tileSize);
      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) this.pathLayer.putTileAt(1, x, y);
      }
    });

    const pond = this.mapData.water[0];
    this.water = this.add.tileSprite(pond.x + pond.width / 2, pond.y + pond.height / 2, pond.width, pond.height, 'water-tile').setDepth(3);
    const maskShape = this.make.graphics({ add: false });
    maskShape.fillStyle(0xffffff).fillEllipse(pond.x + pond.width / 2, pond.y + pond.height / 2, pond.width, pond.height);
    this.water.setMask(maskShape.createGeometryMask());
    this.add.ellipse(pond.x + pond.width / 2, pond.y + pond.height / 2, pond.width, pond.height, 0x000000, 0).setStrokeStyle(15, 0x4c7d53).setDepth(4);
    this.add.text(pond.x + pond.width / 2, pond.y + pond.height - 20, pond.label, { fontFamily: 'Tahoma', fontSize: '20px', color: '#fff', backgroundColor: '#2c4f3f', padding: { x: 10, y: 5 } }).setOrigin(0.5).setDepth(5);
    this.addBlocker(pond.x + pond.width / 2, pond.y + pond.height / 2, pond.width, pond.height);

    this.drawFlag(800, 430);
    this.drawTrees();
    this.drawDecorations();
  }

  addBlocker(x, y, width, height) {
    const zone = this.add.zone(x, y, width, height);
    this.physics.add.existing(zone, true);
    this.blockers.add(zone);
  }

  drawFlag(x, y) {
    this.add.ellipse(x, y + 80, 115, 36, 0x5a8a45, 0.7).setDepth(6);
    this.add.rectangle(x, y, 10, 210, 0x686868).setDepth(7);
    const stripes = [
      this.add.rectangle(x + 42, y - 78, 78, 18, 0xd83438),
      this.add.rectangle(x + 42, y - 60, 78, 12, 0xffffff),
      this.add.rectangle(x + 42, y - 45, 78, 18, 0x3152a4),
    ];
    stripes.forEach((stripe) => stripe.setOrigin(0.5).setDepth(8));
    this.tweens.add({ targets: stripes, scaleX: 0.94, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  drawTrees() {
    this.mapData.trees.forEach(({ x, y, scale }, index) => {
      const tree = this.add.image(x, y, 'tree').setScale(scale).setDepth(12);
      this.tweens.add({ targets: tree, angle: index % 2 ? 1.2 : -1.2, duration: 1700 + index * 80, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.addBlocker(x, y + 35 * scale, 56 * scale, 70 * scale);
    });
  }

  drawDecorations() {
    for (let i = 0; i < 30; i += 1) {
      const x = 320 + (i * 71) % 950;
      const y = 410 + (i * 53) % 370;
      this.add.circle(x, y, 5, [0xf3d35c,0xee7a72,0xffffff,0xb985d8][i % 4]).setDepth(6);
    }
  }

  createAmbientLife() {
    for (let i = 0; i < 5; i += 1) {
      const shadow = this.add.ellipse(-200 - i * 180, 430 + i * 75, 210, 75, 0x355f42, 0.12).setDepth(10);
      this.tweens.add({ targets: shadow, x: 1800, duration: 24000 + i * 3500, repeat: -1, delay: i * 2500 });
    }
    for (let i = 0; i < 8; i += 1) {
      const butterfly = this.add.container(280 + (i * 173) % 1050, 410 + (i * 91) % 360).setDepth(45);
      const left = this.add.ellipse(-5,0,10,7,i % 2 ? 0xf6cf53 : 0xf18cc2);
      const right = this.add.ellipse(5,0,10,7,i % 2 ? 0xf6cf53 : 0xf18cc2);
      butterfly.add([left,right]);
      this.tweens.add({ targets: [left,right], scaleX: 0.25, duration: 170, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: butterfly, x: butterfly.x + 55, y: butterfly.y - 35, duration: 3200 + i * 220, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
  }

  createPlaces() {
    this.mapData.places.forEach((place) => {
      const image = this.add.image(place.x, place.y, place.key).setScale(place.scale).setDepth(20);
      if (place.tint) image.setTint(place.tint);
      this.add.text(place.x, place.y + (place.key === 'school' ? 118 : 88), place.name, { fontFamily: 'Tahoma', fontSize: '19px', color: '#fff4cf', backgroundColor: '#342519', padding: { x: 11, y: 6 }, stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setDepth(24);
      const zone = this.add.zone(place.x, place.y + 20, place.key === 'school' ? 330 : 195, place.key === 'school' ? 150 : 105).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => this.callbacks.onPlace(place));
      this.addBlocker(...place.blocker);
    });
    this.placeZones = this.mapData.places;
  }

  createNpc() {
    const npc = this.mapData.npc;
    this.npc = this.physics.add.staticSprite(npc.x, npc.y, 'teacher').setScale(0.72).setDepth(50).setInteractive({ useHandCursor: true });
    this.add.text(npc.x, npc.y - 73, npc.name, { fontFamily: 'Tahoma', fontSize: '18px', color: '#fff8dd', backgroundColor: '#3d2b1e', padding: { x: 9, y: 5 } }).setOrigin(0.5).setDepth(55);
    const mark = this.add.text(npc.x, npc.y - 50, '!', { fontFamily: 'Tahoma', fontSize: '34px', color: '#ffd94f', stroke: '#493725', strokeThickness: 6 }).setOrigin(0.5).setDepth(56);
    this.tweens.add({ targets: mark, y: npc.y - 58, duration: 650, yoyo: true, repeat: -1 });
    this.npc.on('pointerdown', () => this.callbacks.onNpc());
  }

  createCollectibles() {
    this.collectibles = this.physics.add.group();
    this.mapData.collectibles.forEach(({ x, y }) => {
      const plant = this.add.container(x, y).setDepth(35);
      const glow = this.add.circle(0,5,27,0xf6e47c,0.28);
      const stem = this.add.rectangle(0,9,5,25,0x356f39);
      const leaf1 = this.add.ellipse(-10,0,21,11,0x55a744).setAngle(25);
      const leaf2 = this.add.ellipse(10,-4,21,11,0x75c45b).setAngle(-25);
      plant.add([glow,stem,leaf1,leaf2]);
      this.physics.add.existing(plant);
      plant.body.setCircle(24,-24,-18);
      this.collectibles.add(plant);
      this.tweens.add({ targets: plant, y: y - 9, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
  }

  createPlayer() {
    const key = this.callbacks.player?.character === 'girl' ? 'girl' : 'boy';
    const spawn = this.mapData.spawn;
    this.playerShadow = this.add.ellipse(spawn.x, spawn.y + 37, 42, 15, 0x1d3a25, 0.34).setDepth(70);
    this.player = this.physics.add.sprite(spawn.x, spawn.y, key).setScale(0.68).setDepth(80).setCollideWorldBounds(true);
    this.player.body.setSize(42,55).setOffset(19,60);
    this.physics.add.overlap(this.player, this.collectibles, (_, item) => { item.destroy(); this.callbacks.onCollect(); });
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.03);
  }

  update() {
    const speed = this.keys.SHIFT.isDown ? 330 : 235;
    let x = 0; let y = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) x = -speed;
    if (this.cursors.right.isDown || this.keys.D.isDown) x = speed;
    if (this.cursors.up.isDown || this.keys.W.isDown) y = -speed;
    if (this.cursors.down.isDown || this.keys.S.isDown) y = speed;
    if (x && y) { x *= 0.707; y *= 0.707; }
    this.player.setVelocity(x,y);
    if (x !== 0) this.player.setFlipX(x < 0);
    if (x || y) {
      this.player.setAngle(Math.sin(this.time.now / 85) * 1.6);
      this.player.setScale(0.68, 0.68 + Math.sin(this.time.now / 90) * 0.018);
    } else {
      this.player.setAngle(0);
      this.player.setScale(0.68);
    }
    this.playerShadow.setPosition(this.player.x, this.player.y + 37);
    this.water.tilePositionX += 0.18;

    const npcDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npc.x, this.npc.y);
    let nearest = null; let distance = Infinity;
    this.placeZones.forEach((place) => {
      const current = Phaser.Math.Distance.Between(this.player.x, this.player.y, place.x, place.y);
      if (current < distance) { nearest = place; distance = current; }
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
    render: { antialias: false, pixelArt: true, roundPixels: true },
    scene: [new MainTown(callbacks)],
  });
}
