import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants';
import { type AchievementEntry, type BondState, type NeedsState, type TaskState, type TimeState } from '../state/GameState';
import { HouseScene } from './HouseScene';
import { DECOR_ITEMS } from '../systems/EconomySystem';
import { Events, type ToastPayload } from '../systems/Events';
import { TimeSystem } from '../systems/TimeSystem';
import { DialogBox } from '../ui/DialogBox';
import { NeedsBars } from '../ui/NeedsBars';
import { PixelButton } from '../ui/PixelButton';
import { TaskChecklist } from '../ui/TaskChecklist';
import { Tooltip } from '../ui/Tooltip';

export class UIScene extends Phaser.Scene {
  private needsBars!: NeedsBars;
  private taskList!: TaskChecklist;
  private clockText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private bondText!: Phaser.GameObjects.Text;
  private dialog!: DialogBox;
  private tooltip!: Tooltip;

  private shopPanel!: Phaser.GameObjects.Container;
  private shopVisible = false;

  constructor() {
    super('UIScene');
  }

  create(): void {
    const house = this.scene.get('HouseScene') as HouseScene;

    this.needsBars = new NeedsBars(this, 24, 36);
    this.taskList = new TaskChecklist(this, GAME_WIDTH - 210, 30);

    // bottom status bar with dark wood panel
    const barY = GAME_HEIGHT - 38;
    this.add.rectangle(GAME_WIDTH / 2, barY + 2, GAME_WIDTH - 20, 28, 0x5c3d2e).setOrigin(0.5);
    this.add.rectangle(GAME_WIDTH / 2, barY + 2, GAME_WIDTH - 24, 24, 0x1a1410, 0.9).setOrigin(0.5);

    this.clockText = this.add.text(24, barY, 'Time', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#f5e6c8',
    });

    this.dayText = this.add.text(220, barY, 'Day 1', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#f5e6c8',
    });

    this.coinsText = this.add.text(390, barY, 'Coins: 0', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#e5c040',
    });

    this.bondText = this.add.text(560, barY, 'Bond: 0', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#e8a0b8',
    });

    this.dialog = new DialogBox(this, GAME_WIDTH / 2, 68, 600, 74);
    this.tooltip = new Tooltip(this);

    const interact = new PixelButton(this, GAME_WIDTH - 90, GAME_HEIGHT - 90, 'Use', 96, 72);
    interact.onClick(() => house.handleHUDAction('interact'));

    const water = new PixelButton(this, GAME_WIDTH - 200, GAME_HEIGHT - 90, 'Water+', 112, 72);
    water.onClick(() => house.handleHUDAction('fillWater'));

    const pet = new PixelButton(this, GAME_WIDTH - 320, GAME_HEIGHT - 90, 'Pet', 96, 72);
    pet.onClick(() => house.handleHUDAction('pet'));

    const cancel = new PixelButton(this, 90, GAME_HEIGHT - 90, 'Cancel', 120, 72);
    cancel.onClick(() => house.handleHUDAction('cancel'));

    const shop = new PixelButton(this, 230, GAME_HEIGHT - 90, 'Shop', 120, 72);
    shop.onClick(() => {
      this.shopVisible = !this.shopVisible;
      this.shopPanel.setVisible(this.shopVisible);
    });

    const photo = new PixelButton(this, 370, GAME_HEIGHT - 90, 'Photo', 120, 72);
    photo.onClick(() => this.takeSnapshot());

    this.createShopPanel(house);

    this.game.events.on(Events.NeedsUpdated, (needs: NeedsState) => this.needsBars.setNeeds(needs));
    this.game.events.on(Events.TaskUpdated, (tasks: TaskState) => this.taskList.setTasks(tasks));
    this.game.events.on(Events.TimeUpdated, (time: TimeState) => {
      this.clockText.setText(`Time: ${TimeSystem.formatClock(time.minuteOfDay)}`);
      this.dayText.setText(`Day ${time.dayCount}`);
    });
    this.game.events.on(Events.CoinsUpdated, (coins: number) => {
      this.coinsText.setText(`Coins: ${coins}`);
    });
    this.game.events.on(Events.BondUpdated, (bond: BondState) => {
      this.bondText.setText(`Bond: ${bond.value}`);
    });
    this.game.events.on(Events.Toast, (payload: ToastPayload) => {
      this.dialog.show(payload.message, payload.durationMs ?? 1600);
    });
    this.game.events.on(Events.PathBlocked, () => {
      this.dialog.show('Path blocked', 1200);
    });
    this.game.events.on(Events.AchievementUnlocked, (achievement: AchievementEntry) => {
      this.dialog.show(`Achievement: ${achievement.title}`, 2400);
    });
    this.game.events.on(Events.InteractionEnter, (payload: { label: string; hint?: string; x: number; y: number }) => {
      this.tooltip.show(payload.hint ? `${payload.label}: ${payload.hint}` : payload.label, payload.x, payload.y);
    });
    this.game.events.on(Events.InteractionExit, () => {
      this.tooltip.hide();
    });

    const state = this.registry.get('gameState');
    this.needsBars.setNeeds(state.needsState);
    this.taskList.setTasks(state.taskState);
    this.clockText.setText(`Time: ${TimeSystem.formatClock(state.timeState.minuteOfDay)}`);
    this.dayText.setText(`Day ${state.timeState.dayCount}`);
    this.coinsText.setText(`Coins: ${state.economyState.coins}`);
    this.bondText.setText(`Bond: ${state.bondState.value}`);
  }

  private createShopPanel(house: HouseScene): void {
    const panelWidth = 400;
    const panelHeight = 92 + DECOR_ITEMS.length * 52;

    this.shopPanel = this.add.container(24, 150);

    // dark-wood framed shop panel
    const border = this.add.rectangle(-3, -3, panelWidth + 6, panelHeight + 6, 0x5c3d2e).setOrigin(0);
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x1a1410, 0.95).setOrigin(0);
    bg.setStrokeStyle(2, 0x8b6b42);
    this.shopPanel.add([border, bg]);

    const title = this.add.text(20, 16, 'Decor Shop', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#c49a5a',
    });
    this.shopPanel.add(title);

    // divider under title
    const divider = this.add.rectangle(20, 46, panelWidth - 40, 1, 0x5c3d2e).setOrigin(0);
    this.shopPanel.add(divider);

    DECOR_ITEMS.forEach((item, index) => {
      const y = 56 + index * 52;
      const row = this.add
        .rectangle(16, y, panelWidth - 32, 46, Phaser.Display.Color.HexStringToColor(item.themeColor).color, 0.18)
        .setOrigin(0);
      row.setStrokeStyle(1, 0x8b6b42, 0.4);
      this.shopPanel.add(row);

      const text = this.add.text(26, y + 6, `${item.label} - ${item.cost}c`, {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#f5e6c8',
      });
      this.shopPanel.add(text);

      const subtitle = this.add.text(26, y + 25, item.description, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#c49a5a',
      });
      this.shopPanel.add(subtitle);

      const buy = new PixelButton(this, panelWidth - 54, y + 23, 'Buy', 76, 40);
      buy.onClick(() => house.handleHUDAction(`buy:${item.id}`));
      this.shopPanel.add(buy);
    });

    this.shopPanel.setVisible(false);
  }

  private takeSnapshot(): void {
    this.game.renderer.snapshot((snapshot) => {
      if (!(snapshot instanceof HTMLImageElement)) {
        this.dialog.show('Snapshot unsupported', 1000);
        return;
      }

      const anchor = document.createElement('a');
      anchor.href = snapshot.src;
      anchor.download = `cat-game-${Date.now()}.png`;
      anchor.click();
      this.dialog.show('Photo saved', 1200);
    });
  }
}
