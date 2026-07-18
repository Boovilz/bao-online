import Phaser from 'phaser';
import { BOY_SHEET, GIRL_SHEET } from './spriteData.js';

class MainTown extends Phaser.Scene {
  constructor(callbacks) {
    super('MainTown');
    this.callbacks = callbacks;
    this.assetErrors = new Set();
  }

  preload() {
    const camera = this.cameras.main;
    const centerX = camera.width / 2;
    const centerY = camera.height / 2;
    const loadingBackdrop = this.add.rectangle(centerX, centerY, camera.width, camera.height, 0x102a43).setDepth(1000);
    const loadingTitle = this.add.text(centerX, centerY - 58, 'BAO ONLINE', {
      fontFamily: 'Tahoma', fontSize: '34px', color: '#ffe29a', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1001);
    const loadingText = this.add.text(centerX, centerY + 48, 'กำลังเตรียมหมู่บ้าน... 0%', {
      fontFamily: 'Tahoma', fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(1001);
    const barBg = this.add.rectangle(centerX, centerY, 430, 24, 0x081923).setStrokeStyle(2, 0xf0bd58).setDepth(1001);
    const bar = this.add.rectangle(centerX - 207, centerY, 0, 14, 0xf0bd58).setOrigin(0, 0.5).setDepth(1002);

    this.load.on('progress', (value) => {
      bar.width = 414 * value;
      loadingText.setText(`กำลังเตรียมหมู่บ้าน... ${Math.round(value * 100)}%`);
    });
    this.load.on('loaderror', (file) => {
      this.assetErrors.add(file.key);
      console.warn(`[BAO] Asset failed to load: ${file.key}`);
    });
    this.load.once('complete', () => {
      [loadingBackdrop, loadingTitle, loadingText, barBg, bar].forEach((object) => object.destroy());
    });

    this.load.json('mainTown', '/maps/main-town.json');
    this.load.svg('school', '/assets/school.svg', { width: 420, height: 250 });
    this.load.svg('village', '/assets/village-building.svg', { width: 260, height: 190 });
    this.load.svg('tree', '/assets/tree.svg', { width: 130, height: 170 });
    this.load.svg('teacher', '/assets/npc-teacher.svg', { width: 86, height: 126 });
    this.load.spritesheet('boy-sheet', BOY_SHEET, { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('girl-sheet', GIRL_SHEET, { frameWidth: 48, frameHeight: 64 });
  }

  create() {
    this.mapData = this.cache.json.get('mainTown');
    if (!this.mapData) {
      this.showFatalError('ไม่สามารถโหลดแผนที่หมู่บ้านได้ กรุณารีเฟรชหน้าเว็บ');
      return;
    }

    const { width, height } = this.mapData.world;
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);
    this.blockers = this.physics.add.staticGroup();

    this.generateTerrainTextures();
    this.createTilemap();
    this.createPlaces();
    this.createNpc();
    this.createCollectibles();
    this.createPlayer();
    this.createAmbientLife();
    this.createScreenAtmosphere();
    this.physics.add.collider(this.player, this.blockers);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E,SHIFT');
    this.prompt = this.add.text(640, 654, '', {
      fontFamily: 'Tahoma', fontSize: '21px', color: '#fff', backgroundColor: '#332417',
      padding: { x: 18, y: 10 }, stroke: '#f0bd58', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(300).setVisible(false);

    if (this.assetErrors.size > 0) this.showAssetWarning();
  }

  showFatalError(message) {
    this.add.rectangle(640, 360, 1280, 720, 0x102a43);
    this.add.text(640, 330, 'เกิดข้อผิดพลาดในการเปิดเกม', {
      fontFamily: 'Tahoma', fontSize: '32px', color: '#ffd36b', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(640, 390, message, {
      fontFamily: 'Tahoma', fontSize: '20px', color: '#ffffff', align: 'center', wordWrap: { width: 760 },
    }).setOrigin(0.5);
  }

  showAssetWarning() {
    const warning = this.add.text(1260, 18, 'ใช้ภาพสำรองบางรายการ', {
      fontFamily: 'Tahoma', fontSize: '15px', color: '#3b2914', backgroundColor: '#ffd36b', padding: { x: 10, y: 6 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(500);
    this.time.delayedCall(4500, () => warning.destroy());
  }

  generateTerrainTextures() {
    const grass = this.make.graphics({ add: false });
    grass.fillStyle(0x73b85e).fillRect(0, 0, 64, 64);
    grass.fillStyle(0x82c66a).fillRect(0, 0, 64, 4);
    grass.fillStyle(0x5d9f4d);
    [[9,13],[28,7],[51,20],[17,43],[43,51],[59,35]].forEach(([x,y]) => {
      grass.fillTriangle(x,y,x-3,y+7,x+1,y+5);
      grass.fillTriangle(x+2,y,x+5,y+7,x+1,y+5);
    });
    grass.fillStyle(0x92cf79, 0.55);
    [[4,30],[35,28],[55,56]].forEach(([x,y]) => grass.fillCircle(x,y,2));
    grass.generateTexture('grass-tile', 64, 64);

    const path = this.make.graphics({ add: false });
    path.fillStyle(0xd8b775).fillRect(0, 0, 64, 64);
    path.fillStyle(0xc49b5d).fillRect(0, 0, 64, 4).fillRect(0, 60, 64, 4);
    path.fillStyle(0xb58d55);
    [[7,12,9,4],[34,18,13,5],[16,39,11,4],[47,48,10,4]].forEach(([x,y,w,h]) => path.fillRoundedRect(x,y,w,h,2));
    path.fillStyle(0xead095);
    [[5,30],[29,52],[53,8],[42,33]].forEach(([x,y]) => path.fillCircle(x,y,3));
    path.generateTexture('path-tile', 64, 64);

    const water = this.make.graphics({ add: false });
    water.fillStyle(0x55aec8).fillRect(0, 0, 64, 64);
    water.fillStyle(0x6dc2d6, 0.55).fillRect(0, 0, 64, 12);
    water.lineStyle(3, 0xa6e2ea, 0.9);
    water.lineBetween(4,16,24,16); water.lineBetween(30,42,56,42);
    water.lineStyle(2, 0x3589a9, 0.8);
    water.lineBetween(8,55,28,55); water.lineBetween(38,25,60,25);
    water.generateTexture('water-tile', 64, 64);

    const fallback = this.make.graphics({ add: false });
    fallback.fillStyle(0x000000, 0).fillRect(0, 0, 48, 64);
    fallback.fillStyle(0xf2c49d).fillCircle(24, 15, 10);
    fallback.fillStyle(0x493321).fillRoundedRect(14, 4, 20, 9, 4);
    fallback.fillStyle(0xffffff).fillCircle(20, 15, 2).fillCircle(28, 15, 2);
    fallback.fillStyle(0x3d78b8).fillRoundedRect(12, 26, 24, 25, 6);
    fallback.fillStyle(0x25334a).fillRect(14, 49, 8, 13).fillRect(26, 49, 8, 13);
    fallback.generateTexture('player-fallback', 48, 64);
  }

  createTilemap() {
    const { width, height, tileSize } = this.mapData.world;
    this.add.rectangle(width / 2, height / 2, width, height, 0x9eddf0).setDepth(-10);
    this.add.rectangle(width / 2, 165, width, 300, 0xc9edf6).setDepth(-9);
    this.add.circle(1550, 105, 64, 0xffe39a, 0.92).setDepth(-8);
    this.add.circle(1550, 105, 86, 0xffedb8, 0.22).setDepth(-8);
    this.add.triangle(170,260,-260,135,0,-110,260,135,0x668f70).setAlpha(0.95).setDepth(-7);
    this.add.triangle(620,260,-300,145,0,-125,300,145,0x75a178).setAlpha(0.95).setDepth(-7);
    this.add.triangle(1600,260,-340,155,0,-130,340,155,0x5e8568).setAlpha(0.95).setDepth(-7);
    this.add.ellipse(width / 2, 310, width * 0.95, 110, 0x91bd82, 0.62).setDepth(-6);

    this.createRiceFields();

    this.map = this.make.tilemap({ tileWidth: tileSize, tileHeight: tileSize, width: Math.ceil(width / tileSize), height: Math.ceil(height / tileSize) });
    const grassSet = this.map.addTilesetImage('grass-tile', 'grass-tile', tileSize, tileSize, 0, 0, 0);
    const pathSet = this.map.addTilesetImage('path-tile', 'path-tile', tileSize, tileSize, 0, 0, 1);
    this.map.createBlankLayer('Ground', grassSet).fill(0).setDepth(1);
    this.pathLayer = this.map.createBlankLayer('Road', pathSet).fill(-1).setDepth(2);

    this.mapData.roads.forEach((road) => {
      const sx = Math.floor(road.x / tileSize);
      const sy = Math.floor(road.y / tileSize);
      const ex = Math.ceil((road.x + road.width) / tileSize);
      const ey = Math.ceil((road.y + road.height) / tileSize);
      for (let y = sy; y < ey; y += 1) for (let x = sx; x < ex; x += 1) this.pathLayer.putTileAt(1, x, y);
      this.add.rectangle(road.x + road.width / 2, road.y + road.height / 2, road.width, road.height, 0x7e5e38, 0)
        .setStrokeStyle(5, 0x9b7545, 0.45).setDepth(2);
    });

    const pond = this.mapData.water[0];
    this.add.ellipse(pond.x + pond.width / 2, pond.y + pond.height / 2 + 8, pond.width + 34, pond.height + 28, 0x315f45, 0.28).setDepth(2);
    this.water = this.add.tileSprite(pond.x + pond.width / 2, pond.y + pond.height / 2, pond.width, pond.height, 'water-tile').setDepth(3);
    const maskShape = this.make.graphics({ add: false });
    maskShape.fillStyle(0xffffff).fillEllipse(pond.x + pond.width / 2, pond.y + pond.height / 2, pond.width, pond.height);
    this.water.setMask(maskShape.createGeometryMask());
    this.add.ellipse(pond.x + pond.width / 2, pond.y + pond.height / 2, pond.width, pond.height, 0x000000, 0).setStrokeStyle(15, 0x4b8057).setDepth(4);
    this.add.ellipse(pond.x + pond.width * 0.42, pond.y + pond.height * 0.38, 86, 20, 0xffffff, 0.16).setDepth(4);
    this.add.text(pond.x + pond.width / 2, pond.y + pond.height - 20, pond.label, {
      fontFamily: 'Tahoma', fontSize: '20px', color: '#fff', backgroundColor: '#2c4f3f', padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(5);
    this.addBlocker(pond.x + pond.width / 2, pond.y + pond.height / 2, pond.width, pond.height);

    this.drawFlag(960, 455);
    this.drawTrees();
    this.drawDecorations();
  }

  createRiceFields() {
    const fields = [
      { x: 140, y: 335, w: 250, h: 125 },
      { x: 1640, y: 350, w: 300, h: 135 },
    ];
    fields.forEach((field) => {
      this.add.rectangle(field.x, field.y, field.w, field.h, 0xc9c35a, 0.72).setStrokeStyle(5, 0x718f48, 0.75).setDepth(-4);
      for (let row = -2; row <= 2; row += 1) {
        const line = this.add.line(field.x, field.y + row * 21, -field.w / 2 + 12, 0, field.w / 2 - 12, 0, 0xf2dc72, 0.68).setLineWidth(3).setDepth(-3);
        this.tweens.add({ targets: line, alpha: 0.35, duration: 1700 + row * 90, yoyo: true, repeat: -1 });
      }
    });
  }

  addBlocker(x, y, width, height) {
    const zone = this.add.zone(x, y, width, height);
    this.physics.add.existing(zone, true);
    this.blockers.add(zone);
  }

  drawFlag(x, y) {
    this.add.ellipse(x, y + 80, 115, 36, 0x395e39, 0.28).setDepth(6);
    this.add.rectangle(x + 5, y + 4, 10, 210, 0x1f3327, 0.2).setDepth(6);
    this.add.rectangle(x, y, 10, 210, 0x707070).setDepth(7);
    this.add.circle(x, y - 107, 9, 0xe7c35f).setDepth(8);
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
      this.add.ellipse(x + 8, y + 65 * scale, 82 * scale, 25 * scale, 0x203d2c, 0.24).setDepth(11);
      const tree = this.add.image(x, y, 'tree').setScale(scale).setDepth(12);
      this.tweens.add({ targets: tree, angle: index % 2 ? 0.8 : -0.8, duration: 1900 + index * 65, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.addBlocker(x, y + 35 * scale, 56 * scale, 70 * scale);
    });
  }

  drawDecorations() {
    for (let i = 0; i < 54; i += 1) {
      const x = 220 + (i * 113) % 1510;
      const y = 410 + (i * 67) % 560;
      const flower = this.add.container(x, y).setDepth(6);
      const color = [0xf3d35c,0xee7a72,0xffffff,0xb985d8][i % 4];
      flower.add([
        this.add.rectangle(0, 5, 2, 10, 0x4f8a45),
        this.add.circle(-3, 0, 3, color), this.add.circle(3, 0, 3, color),
        this.add.circle(0, -3, 3, color), this.add.circle(0, 3, 3, color),
        this.add.circle(0, 0, 2, 0xf5cf4c),
      ]);
      this.tweens.add({ targets: flower, angle: i % 2 ? 3 : -3, duration: 1400 + i * 12, yoyo: true, repeat: -1 });
    }
  }

  createAmbientLife() {
    for (let i = 0; i < 7; i += 1) {
      const butterfly = this.add.container(280 + (i * 211) % 1300, 430 + (i * 97) % 430).setDepth(45);
      const color = i % 2 ? 0xf6cf53 : 0xf18cc2;
      const left = this.add.ellipse(-5,0,10,7,color);
      const right = this.add.ellipse(5,0,10,7,color);
      butterfly.add([left,right]);
      this.tweens.add({ targets: [left,right], scaleX: 0.25, duration: 170, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: butterfly, x: butterfly.x + 55, y: butterfly.y - 35, duration: 3200 + i * 220, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    for (let i = 0; i < 12; i += 1) {
      const mote = this.add.circle(120 + i * 145, 300 + (i * 79) % 520, 2 + (i % 2), 0xfff1b2, 0.34).setDepth(90);
      this.tweens.add({ targets: mote, x: mote.x + 95, y: mote.y - 38, alpha: 0.08, duration: 4300 + i * 180, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
  }

  createScreenAtmosphere() {
    const topGlow = this.add.rectangle(640, 0, 1280, 115, 0xffe8ac, 0.08).setOrigin(0.5, 0).setScrollFactor(0).setDepth(260);
    this.tweens.add({ targets: topGlow, alpha: 0.035, duration: 3200, yoyo: true, repeat: -1 });
    this.add.rectangle(640, 360, 1270, 710, 0x000000, 0).setStrokeStyle(18, 0x16382f, 0.12).setScrollFactor(0).setDepth(270);
  }

  createPlaces() {
    this.mapData.places.forEach((place) => {
      const shadowWidth = place.key === 'school' ? 330 : 205;
      this.add.ellipse(place.x + 10, place.y + (place.key === 'school' ? 88 : 68), shadowWidth, 42, 0x1d3a25, 0.22).setDepth(19);
      const image = this.add.image(place.x, place.y, place.key).setScale(place.scale).setDepth(20);
      if (place.tint) image.setTint(place.tint);
      const label = this.add.text(place.x, place.y + (place.key === 'school' ? 118 : 88), place.name, {
        fontFamily: 'Tahoma', fontSize: '18px', color: '#fff4cf', backgroundColor: '#342519',
        padding: { x: 10, y: 5 }, stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(24);
      label.setShadow(0, 3, '#000000', 4, false, true);
      const zone = this.add.zone(place.x, place.y + 20, place.key === 'school' ? 330 : 195, place.key === 'school' ? 150 : 105).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => image.setScale(place.scale * 1.025));
      zone.on('pointerout', () => image.setScale(place.scale));
      zone.on('pointerdown', () => this.callbacks.onPlace(place));
      this.addBlocker(...place.blocker);
    });
    this.placeZones = this.mapData.places;
  }

  createNpc() {
    const npc = this.mapData.npc;
    this.add.ellipse(npc.x + 5, npc.y + 45, 58, 17, 0x20382a, 0.25).setDepth(49);
    this.npc = this.physics.add.staticSprite(npc.x, npc.y, 'teacher').setScale(0.72).setDepth(50).setInteractive({ useHandCursor: true });
    this.add.text(npc.x, npc.y - 73, npc.name, {
      fontFamily: 'Tahoma', fontSize: '18px', color: '#fff8dd', backgroundColor: '#3d2b1e', padding: { x: 9, y: 5 },
    }).setOrigin(0.5).setDepth(55);
    const mark = this.add.text(npc.x, npc.y - 50, '!', {
      fontFamily: 'Tahoma', fontSize: '34px', color: '#ffd94f', stroke: '#493725', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(56);
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

  createPlayerAnimations(sheetKey) {
    if (!this.textures.exists(sheetKey) || this.textures.get(sheetKey).frameTotal < 12) return false;
    const names = ['down', 'left', 'right', 'up'];
    names.forEach((direction, row) => {
      const walkKey = `${sheetKey}-${direction}`;
      const idleKey = `${sheetKey}-idle-${direction}`;
      if (!this.anims.exists(walkKey)) this.anims.create({ key: walkKey, frames: this.anims.generateFrameNumbers(sheetKey, { start: row * 3, end: row * 3 + 2 }), frameRate: 8, repeat: -1 });
      if (!this.anims.exists(idleKey)) this.anims.create({ key: idleKey, frames: [{ key: sheetKey, frame: row * 3 + 1 }], frameRate: 1 });
    });
    return true;
  }

  createPlayer() {
    const requestedKey = this.callbacks.player?.character === 'girl' ? 'girl-sheet' : 'boy-sheet';
    this.playerAnimated = this.createPlayerAnimations(requestedKey);
    this.playerKey = this.playerAnimated ? requestedKey : 'player-fallback';
    if (!this.playerAnimated) this.assetErrors.add(requestedKey);
    const spawn = this.mapData.spawn;
    this.playerShadow = this.add.ellipse(spawn.x, spawn.y + 27, 34, 12, 0x1d3a25, 0.32).setDepth(70);
    this.player = this.physics.add.sprite(spawn.x, spawn.y, this.playerKey, this.playerAnimated ? 1 : undefined).setScale(1.35).setDepth(80).setCollideWorldBounds(true);
    this.player.body.setSize(22, 22).setOffset(13, 39);
    this.lastDirection = 'down';
    if (this.playerAnimated) this.player.play(`${this.playerKey}-idle-down`);
    this.physics.add.overlap(this.player, this.collectibles, (_, item) => {
      item.destroy();
      this.cameras.main.shake(90, 0.003);
      this.callbacks.onCollect();
    });
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.05);
  }

  update() {
    if (!this.player || !this.keys || !this.cursors) return;
    const speed = this.keys.SHIFT.isDown ? 330 : 235;
    let x = 0;
    let y = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) x = -speed;
    if (this.cursors.right.isDown || this.keys.D.isDown) x = speed;
    if (this.cursors.up.isDown || this.keys.W.isDown) y = -speed;
    if (this.cursors.down.isDown || this.keys.S.isDown) y = speed;
    if (x && y) { x *= 0.707; y *= 0.707; }
    this.player.setVelocity(x, y);

    let direction = this.lastDirection;
    if (Math.abs(x) > Math.abs(y)) direction = x < 0 ? 'left' : 'right';
    else if (y !== 0) direction = y < 0 ? 'up' : 'down';

    if (this.playerAnimated) {
      if (x || y) {
        this.lastDirection = direction;
        this.player.play(`${this.playerKey}-${direction}`, true);
      } else this.player.play(`${this.playerKey}-idle-${this.lastDirection}`, true);
    } else if (x !== 0) this.player.setFlipX(x < 0);

    this.playerShadow.setPosition(this.player.x, this.player.y + 27);
    this.water.tilePositionX += 0.18;
    this.water.tilePositionY += 0.03;

    const npcDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npc.x, this.npc.y);
    let nearest = null;
    let distance = Infinity;
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
