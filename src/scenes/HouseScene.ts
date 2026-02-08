import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from '../constants';
import { AssetGenerator } from '../assets/AssetGenerator';
import { Cabinet } from '../objects/Cabinet';
import { CatBed } from '../objects/CatBed';
import { Cat } from '../objects/Cat';
import { CatTree } from '../objects/CatTree';
import { FoodBowl } from '../objects/FoodBowl';
import { InteractiveObject } from '../objects/InteractiveObject';
import { LitterBox } from '../objects/LitterBox';
import { Player } from '../objects/Player';
import { Toy } from '../objects/Toy';
import { WaterBowl } from '../objects/WaterBowl';
import { type GameState } from '../state/GameState';
import { AchievementSystem } from '../systems/AchievementSystem';
import { AnimationManager } from '../systems/AnimationManager';
import { AudioSystem } from '../systems/AudioSystem';
import { BondSystem } from '../systems/BondSystem';
import { DECOR_ITEMS, EconomySystem } from '../systems/EconomySystem';
import { Events, type GameplayActionPayload, type ToastPayload } from '../systems/Events';
import { GrowthSystem } from '../systems/GrowthSystem';
import { InputController } from '../systems/InputController';
import { NeedsSystem } from '../systems/NeedsSystem';
import { PathfindingSystem } from '../systems/PathfindingSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { TaskManager } from '../systems/TaskManager';
import { TimeSystem } from '../systems/TimeSystem';

export class HouseScene extends Phaser.Scene {
  private state!: GameState;
  private saveSystem!: SaveSystem;

  private player!: Player;
  private cat!: Cat;

  private inputController!: InputController;
  private pathfinding = new PathfindingSystem();
  private audio = new AudioSystem();

  private needsSystem!: NeedsSystem;
  private taskManager!: TaskManager;
  private timeSystem!: TimeSystem;
  private bondSystem!: BondSystem;
  private achievementSystem!: AchievementSystem;
  private growthSystem = new GrowthSystem();
  private economySystem!: EconomySystem;

  private objects: InteractiveObject[] = [];
  private objectBySprite = new Map<Phaser.GameObjects.Image, InteractiveObject>();
  private objectById = new Map<string, InteractiveObject>();
  private pendingInteraction: InteractiveObject | null = null;
  private pendingCatPet = false;

  private introCenterPending = true;
  private introCenterTarget = new Phaser.Math.Vector2(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);
  private introMarker?: Phaser.GameObjects.Arc;
  private introLabel?: Phaser.GameObjects.Text;

  private wallLayer!: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super('HouseScene');
  }

  create(): void {
    this.state = this.registry.get('gameState');
    this.saveSystem = this.registry.get('saveSystem');

    AssetGenerator.generate(this, this.state.playerProfile);
    // Re-register animations after regenerating runtime textures.
    AnimationManager.register(this, true);

    this.needsSystem = new NeedsSystem(this.state.needsState);
    this.taskManager = new TaskManager(this.state.taskState);
    this.timeSystem = new TimeSystem(this.state.timeState);
    this.bondSystem = new BondSystem(this.state.bondState);
    this.achievementSystem = new AchievementSystem(this.state.achievementState);
    this.economySystem = new EconomySystem(this.state.economyState);

    const offlineMinutes = this.registry.get('offlineMinutes') ?? 0;
    if (offlineMinutes > 0) {
      this.needsSystem.tick(offlineMinutes, this.state.catProfile.breedId);
    }

    this.createTilemap();
    this.applyDecorTheme(this.state.houseDecorState.activeTheme);

    this.player = new Player(this, 520, 560);
    this.cat = new Cat(this, 420, 520, this.state.catProfile.breedId);
    this.cat.setInteractive({ cursor: 'pointer' });
    this.cat.setHouseBounds(new Phaser.Geom.Rectangle(80, 180, 860, 520));

    this.physics.add.collider(this.player, this.wallLayer);
    this.physics.add.collider(this.cat, this.wallLayer);

    this.createInteractiveObjects();
    this.createCenterIntroPrompt();

    this.inputController = new InputController(this);

    this.input.on('pointerdown', async (pointer: Phaser.Input.Pointer) => {
      await this.audio.play('ui');
      await this.handlePointerDown(pointer);
    });

    this.input.keyboard?.on('keydown-F', () => {
      this.player.setCarrying('water');
      this.emitToast('Filled water container');
    });

    this.game.events.on(Events.GameplayAction, this.onGameplayAction, this);

    this.time.addEvent({
      delay: 60000,
      loop: true,
      callback: () => this.persistState(),
    });

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.persistState();
      this.game.events.off(Events.GameplayAction, this.onGameplayAction, this);
    });

    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene');
    }
    this.scene.bringToTop('UIScene');

    this.syncAndBroadcast();
  }

  private createTilemap(): void {
    const map = this.make.tilemap({
      width: GAME_WIDTH / TILE_SIZE,
      height: GAME_HEIGHT / TILE_SIZE,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const tiles = map.addTilesetImage('tileset_house', 'tileset_house', TILE_SIZE, TILE_SIZE, 0, 0);

    if (!tiles) {
      throw new Error('Failed to create tileset for house');
    }

    const floor = map.createBlankLayer('floor', tiles);
    const walls = map.createBlankLayer('walls', tiles);

    if (!floor || !walls) {
      throw new Error('Failed to create house layers');
    }

    floor.fill(0);

    for (let y = 2; y < 8; y += 1) {
      for (let x = 1; x < 8; x += 1) {
        floor.putTileAt(4, x, y);
      }
    }

    for (let y = 2; y < 8; y += 1) {
      for (let x = 20; x < 31; x += 1) {
        floor.putTileAt((x + y) % 2 === 0 ? 2 : 3, x, y);
      }
    }

    for (let y = 10; y < 17; y += 1) {
      for (let x = 7; x < 25; x += 1) {
        floor.putTileAt(6, x, y);
      }
    }

    const width = map.width;
    const height = map.height;

    for (let x = 0; x < width; x += 1) {
      walls.putTileAt(12, x, 0);
      walls.putTileAt(12, x, height - 1);
    }

    for (let y = 0; y < height; y += 1) {
      walls.putTileAt(12, 0, y);
      walls.putTileAt(12, width - 1, y);
    }

    for (let y = 1; y < 12; y += 1) {
      walls.putTileAt(13, 10, y);
      walls.putTileAt(13, 20, y);
    }

    walls.putTileAt(14, 6, 15);
    walls.putTileAt(14, 8, 15);
    walls.putTileAt(14, 24, 14);
    walls.putTileAt(14, 25, 14);
    walls.putTileAt(14, 27, 14);

    walls.setCollision([12, 13, 14, 15]);

    this.wallLayer = walls;
    this.pathfinding.initializeFromLayer(walls);
  }

  private createInteractiveObjects(): void {
    this.objects = [];
    this.objectBySprite.clear();
    this.objectById.clear();

    const all: InteractiveObject[] = [
      new Cabinet(this, 850, 180),
      new FoodBowl(this, 820, 330),
      new WaterBowl(this, 900, 330),
      new LitterBox(this, 150, 300),
      new Toy(this, 480, 310),
    ];

    for (const object of all) {
      this.addInteractiveObject(object);
    }

    this.ensurePurchasedFurniturePresent();
  }

  private addInteractiveObject(object: InteractiveObject): void {
    object.sprite.setInteractive({ cursor: 'pointer' });
    this.objectBySprite.set(object.sprite, object);
    this.objectById.set(object.id, object);
    this.objects.push(object);
  }

  private ensurePurchasedFurniturePresent(): void {
    for (const id of this.state.economyState.purchasedDecorIds) {
      this.spawnFurnitureById(id);
    }
  }

  private spawnFurnitureById(id: string): void {
    if (id === 'cat_tree' && !this.objectById.has(id)) {
      this.addInteractiveObject(new CatTree(this, 250, 200));
      return;
    }

    if (id === 'cat_bed' && !this.objectById.has(id)) {
      this.addInteractiveObject(new CatBed(this, 620, 540));
    }
  }

  private createCenterIntroPrompt(): void {
    this.introMarker = this.add.circle(this.introCenterTarget.x, this.introCenterTarget.y, 36, 0xd8f4b2, 0.2);
    this.introMarker.setStrokeStyle(3, 0xbecf98, 0.8);
    this.introMarker.setDepth(4);

    this.introLabel = this.add.text(this.introCenterTarget.x, this.introCenterTarget.y - 54, 'Move Here To Start', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#f1ffd5',
      stroke: '#233320',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.introLabel.setDepth(4);

    this.tweens.add({
      targets: this.introMarker,
      scaleX: 1.18,
      scaleY: 1.18,
      alpha: 0.32,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    this.emitToast('Move to the glowing center spot to begin');
  }

  private async handlePointerDown(pointer: Phaser.Input.Pointer): Promise<void> {
    const gameObjects = this.input.manager.hitTest(pointer, this.children.list, this.cameras.main);
    if (gameObjects.includes(this.cat)) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.cat.x, this.cat.y);
      if (distance <= 96) {
        this.petCat();
      } else {
        this.pendingCatPet = true;
        await this.movePlayerTo(this.cat.x, this.cat.y + 24);
      }
      return;
    }

    const objectSprite = gameObjects.find(
      (entry): entry is Phaser.GameObjects.Image =>
        entry instanceof Phaser.GameObjects.Image && this.objectBySprite.has(entry),
    );

    if (objectSprite && this.objectBySprite.has(objectSprite)) {
      const target = this.objectBySprite.get(objectSprite)!;
      if (target.isPlayerInRange) {
        await this.triggerInteraction(target);
      } else {
        this.pendingInteraction = target;
        await this.movePlayerTo(target.getInteractionPoint().x, target.getInteractionPoint().y);
      }
      return;
    }

    await this.movePlayerTo(pointer.worldX, pointer.worldY);
    this.pendingInteraction = null;
    this.pendingCatPet = false;
  }

  private async movePlayerTo(worldX: number, worldY: number): Promise<void> {
    const start = this.pathfinding.worldToTile(this.player.x, this.player.y);
    const target = this.pathfinding.worldToTile(worldX, worldY);

    const path = await this.pathfinding.findPath(start.tileX, start.tileY, target.tileX, target.tileY);

    if (!path || path.length === 0) {
      this.game.events.emit(Events.PathBlocked);
      return;
    }

    const worldPath = path.slice(1).map((node) => this.pathfinding.tileToWorld(node.tileX, node.tileY));
    this.player.followPath(worldPath);
  }

  private async triggerInteraction(object: InteractiveObject): Promise<void> {
    if (!object.canInteract({ player: this.player, cat: this.cat, events: this.game.events })) {
      return;
    }

    await object.onInteract({ player: this.player, cat: this.cat, events: this.game.events });
  }

  private onGameplayAction(payload: GameplayActionPayload): void {
    void this.audio.play(payload.action === 'pet' ? 'pet' : payload.action);

    const actionMap = {
      feed: 'feed',
      water: 'water',
      play: 'play',
      cleanLitter: 'cleanLitter',
      pet: null,
    } as const;

    if (payload.action === 'pet') {
      const bond = this.bondSystem.add(2);
      if (bond.tierIncreased) {
        this.emitToast('Bond level increased');
      }
      this.game.events.emit(Events.BondUpdated, bond.state);
      this.syncAndBroadcast();
      return;
    }

    const taskKey = actionMap[payload.action];
    if (!taskKey) {
      return;
    }

    this.needsSystem.applyCareAction(payload.action);
    const completion = this.taskManager.markCompleted(taskKey);
    const bond = this.bondSystem.add(4);

    if (bond.tierIncreased) {
      this.emitToast(`Bond tier ${bond.state.tier} reached`);
      if (bond.state.tier >= 2) {
        const achievement = this.achievementSystem.unlock('bond_2');
        if (achievement) {
          this.game.events.emit(Events.AchievementUnlocked, achievement);
        }
      }
    }

    if (completion.allComplete) {
      this.economySystem.awardCoins(15);
      this.emitToast('All tasks complete! +15 coins');
      const firstDay = this.achievementSystem.unlock('first_day');
      if (firstDay) {
        this.game.events.emit(Events.AchievementUnlocked, firstDay);
      }

      this.state.catProfile.ageDays += 1;
      this.state.catProfile.growthStage = this.growthSystem.computeGrowthStage(this.state.catProfile.ageDays);
      this.taskManager.startNextDay();

      if (this.state.timeState.dayCount >= 7) {
        const streak = this.achievementSystem.unlock('week_streak');
        if (streak) {
          this.game.events.emit(Events.AchievementUnlocked, streak);
        }
      }
    }

    this.syncAndBroadcast();
  }

  private emitToast(message: string): void {
    const payload: ToastPayload = { message, durationMs: 1700 };
    this.game.events.emit(Events.Toast, payload);
  }

  private petCat(): void {
    this.game.events.emit(Events.GameplayAction, { action: 'pet' });
    this.cat.reactHappy(1.4);
    this.emitToast('You pet your cat');
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta / 1000;
    const input = this.inputController.update();

    if (input.mode === 'keyboard' && (Math.abs(input.moveX) > 0 || Math.abs(input.moveY) > 0)) {
      this.player.setMoveAxis(input.moveX, input.moveY);
      this.pendingInteraction = null;
      this.pendingCatPet = false;
    } else {
      this.player.setMoveAxis(0, 0);
    }

    this.player.update();

    for (const object of this.objects) {
      object.updateRange(this.player);
    }

    if (this.pendingInteraction && !this.player.hasPath() && this.pendingInteraction.isPlayerInRange) {
      void this.triggerInteraction(this.pendingInteraction);
      this.pendingInteraction = null;
    }

    if (this.pendingCatPet && !this.player.hasPath()) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.cat.x, this.cat.y);
      if (distance <= 96) {
        this.petCat();
      } else {
        this.emitToast('Cat moved. Tap again to pet');
      }
      this.pendingCatPet = false;
    }

    if (this.introCenterPending) {
      const distanceToCenter = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.introCenterTarget.x,
        this.introCenterTarget.y,
      );
      if (distanceToCenter <= 82) {
        this.introCenterPending = false;
        this.introMarker?.destroy();
        this.introLabel?.destroy();
        this.emitToast('Nice! Grab a toy, food, or water to interact');
      }
    }

    const catMode =
      this.player.carryingItem === 'toy'
        ? 'play'
        : this.player.carryingItem !== null
          ? 'follow'
          : 'idle';
    this.cat.update(deltaSeconds, catMode, new Phaser.Math.Vector2(this.player.x, this.player.y));

    const tickResult = this.timeSystem.tick(deltaSeconds);
    const growthMultiplier = this.growthSystem.computeNeedMultiplier(this.state.catProfile.growthStage);
    this.needsSystem.tick(tickResult.deltaMinutes * growthMultiplier, this.state.catProfile.breedId);

    if (tickResult.dayRolled) {
      const taskState = this.taskManager.startNextDay();
      this.state.taskState = taskState;
      this.state.catProfile.ageDays += 1;
      this.state.catProfile.growthStage = this.growthSystem.computeGrowthStage(this.state.catProfile.ageDays);
    }

    const litter = this.objects.find((obj): obj is LitterBox => obj instanceof LitterBox);
    litter?.increaseDirt(deltaSeconds * 0.2);

    this.syncAndBroadcast(false);
  }

  handleHUDAction(action: 'interact' | 'cancel' | 'fillWater' | 'pet' | 'photo' | `buy:${string}`): void {
    if (action === 'cancel') {
      this.pendingInteraction = null;
      this.player.clearPath();
      return;
    }

    if (action === 'fillWater') {
      this.player.setCarrying('water');
      this.emitToast('Carrying water');
      return;
    }

    if (action === 'interact') {
      const nearby = this.objects.find((obj) => obj.isPlayerInRange);
      if (nearby) {
        void this.triggerInteraction(nearby);
      } else {
        this.emitToast('Move closer to an object');
      }
      return;
    }

    if (action === 'pet') {
      this.petCat();
      return;
    }

    if (action.startsWith('buy:')) {
      const id = action.replace('buy:', '');
      const alreadyOwned = this.state.economyState.purchasedDecorIds.includes(id);
      const result = this.economySystem.purchaseDecor(id);
      if (result.success) {
        const item = DECOR_ITEMS.find((entry) => entry.id === id);
        if (item) {
          if (item.kind === 'theme') {
            this.state.houseDecorState.activeTheme = item.themeColor;
            this.applyDecorTheme(item.themeColor);
            this.emitToast(alreadyOwned ? `${item.label} already active` : `${item.label} applied`);
          } else {
            this.spawnFurnitureById(item.id);
            this.emitToast(alreadyOwned ? `${item.label} already owned` : `${item.label} purchased`);
          }
        }
        const achievement = this.achievementSystem.unlock('first_shop');
        if (achievement) {
          this.game.events.emit(Events.AchievementUnlocked, achievement);
        }
      } else {
        this.emitToast('Not enough coins');
      }
      this.syncAndBroadcast();
    }
  }

  private applyDecorTheme(color: string): void {
    this.cameras.main.setBackgroundColor(color);
    this.game.events.emit(Events.DecorUpdated, { color });
  }

  private syncAndBroadcast(emitAll = true): void {
    this.state.needsState = this.needsSystem.getState();
    this.state.taskState = this.taskManager.getState();
    this.state.timeState = this.timeSystem.getState();
    this.state.bondState = this.bondSystem.getState();
    this.state.achievementState = this.achievementSystem.getState();
    this.state.economyState = this.economySystem.getState();

    this.registry.set('gameState', this.state);

    if (!emitAll) {
      return;
    }

    this.game.events.emit(Events.NeedsUpdated, this.state.needsState);
    this.game.events.emit(Events.TaskUpdated, this.state.taskState);
    this.game.events.emit(Events.TimeUpdated, this.state.timeState);
    this.game.events.emit(Events.CoinsUpdated, this.state.economyState.coins);
    this.game.events.emit(Events.BondUpdated, this.state.bondState);
  }

  private persistState(): void {
    this.syncAndBroadcast(false);
    this.saveSystem.save(this.state);
  }
}
