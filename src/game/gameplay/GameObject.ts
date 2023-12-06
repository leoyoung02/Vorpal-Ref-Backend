import { ObjectMoveParams, coords, movings, rect } from '../types/gameplay';
import { play } from '../types';
import { GameRoom } from '../core/Room';
import { FrameInterval, gameField, idLength, moveFrame } from '../config';
import { actionList } from '../types/Messages';
import { MoveFunction } from '../types/interfaces';
import ObjectListManager from '../core/ListManager';

export default abstract class GameObject {
  protected id: string = '';
  protected room: GameRoom;
  protected inMoving = false;
  protected moveTimer: NodeJS.Timer;
  protected manager: ObjectListManager<any>;

  public center: play.coords;
  public radius: number;
  public RoomAction: any;
  public owner: string;
  public class: string;
  public movingType: movings;
  public speed: number = 0;
  public target: coords;
  public isActive: boolean = false;

  constructor(
    _room: GameRoom,
    _owner: string,
    _coords: play.coords,
    _radius: number,
    _class: string,
    _manager: ObjectListManager<any>,
  ) {
    const _id = this.GenerateId(idLength);
    this.room = _room;
    this.owner = _owner;
    this.radius = _radius;
    this.id = _id;
    this.center = {
      ..._coords,
    };
    this.class = _class;
    this.manager = _manager;
  }

  public GenerateId(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  public MoveStop(point: coords = this.center, notify = true, onFinish?: MoveFunction) {
    if (this.moveTimer) clearInterval(this.moveTimer);
    this.center.x = point.x;
    this.center.y = point.y;
    if (notify) {
        this.room.ReSendMessage(
          JSON.stringify({
            action: actionList.objectupdate,
            id: this.id,
            data: {
              event: actionList.stopmoving,
              position: this.center,
            },
          }),
        );
    }
    // log
    const logMsg = {
      action: actionList.log,
      onfinish: onFinish
    }
    this.room.ReSendMessage(JSON.stringify(logMsg));
    // End log
    this.inMoving = false;
    if (onFinish) onFinish(this.id, this.center);
    return this.center;
  }

  public isOutside() {
    return (
      this.center.x < 0 ||
      this.center.x > gameField[0] ||
      this.center.y < 0 ||
      this.center.y > gameField[1]
    );
  }

  public async MoveToPoint(point: coords, callback: any) {
    if (this.speed === 0) {
      return false;
    }
    
    const distance = this.manager.calcRange(this.center, point);
    const reached = distance <= this.speed ? true : false;
    if (reached) {
      this.center = point;
      if (callback) callback();
      return reached;
    }

    const dX = point.x - this.center.x;
    const dY = point.y - this.center.y;
    const angle = Math.atan2(dY, dX)
    const newPoint : coords = {
      x: this.center.x + (this.speed * Math.cos(angle)),
      y: this.center.y + (this.speed * Math.sin(angle))
    }
    this.center = newPoint;
    if (callback) callback();
    return reached;
  }

  public async MoveTo(
    target: coords,
    time: number,
    onMove?: MoveFunction,
    onFinish?: MoveFunction,
  ): Promise<coords> {
    return await new Promise((resolve) => {
      if (this.inMoving) {
        this.MoveStop(this.center, true);
      }
      this.inMoving = true;
      const frames = Math.ceil(time / FrameInterval);
      const point: coords = { x: target.x, y: target.y };
      const step: coords = {
        x: (point.x - this.center.x) / frames,
        y: (point.y - this.center.y) / frames,
      };
      this.room.ReSendMessage(
        JSON.stringify({
          action: actionList.objectupdate,
          id: this.id,
          data: {
            event: actionList.startmoving,
            target: target,
            timeTo: time,
          },
        }),
      );
      let timePast = 0;
      this.moveTimer = setInterval(() => {
        timePast += moveFrame;
        this.center.y += step.y;
        this.center.x += step.x;
        if (onMove) onMove(this.id, this.center);
        if (timePast >= time) {
          resolve(this.MoveStop(target, true, onFinish));
        }
      }, FrameInterval);
    });
  }

  public async MoveDirect(
    speed: number,
    angle: number,
    limit?: coords,
    onMove?: MoveFunction,
    onFinish?: MoveFunction,
  ): Promise<coords> {
    return await new Promise((resolve) => {
      if (this.inMoving) {
        this.MoveStop(this.center, false)
      }
      const queX = Math.cos(angle);
      const queY = Math.sin(angle);
      this.inMoving = true;
      this.moveTimer = setInterval(() => {
        const values: coords = {
          x: speed * queX,
          y: speed * queY,
        };
        this.center.x += values.x;
        this.center.y += values.y;
        if (onMove) onMove(this.id, this.center);
        if (limit) {
          if (this.center.x >= limit.x || this.center.y >= limit.x) {
            resolve(this.MoveStop(this.center, true, onFinish));
          }
        }
        if (this.isOutside()) {
          resolve(this.MoveStop(this.center, true, onFinish));
          this.destroy();
        }
      }, FrameInterval);
    });
  }

  public getId(): string {
    return this.id;
  }

  /* public center(): coords {
    return {
      x: this.rect.x + this.rect.width / 2,
      y: this.rect.y + this.rect.height / 2,
    };
  } */

  abstract destroy: () => void;
}
