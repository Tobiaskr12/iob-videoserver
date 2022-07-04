import { Guid } from 'guid-typescript';
import { injectable } from 'tsyringe';
import Savable from '../Common/Savable.interface';
import DeserializationError from '../Errors/DeserializationError';
import validateGUID from '../Common/Util/GUIDValidator';

export interface IEventFactory {
  create(message: string, timestamp: number, id?: string, userIds?: string[], roomId?: string): Event;
}

@injectable()
export class EventFactory implements IEventFactory {
  public create = (message: string, timestamp: number, id?: string, userIds?: string[], roomId?: string): Event => {
    return new Event(message, timestamp, id, userIds, roomId);
  }
}

export default class Event implements Savable {
  private _id: string;
  private timestamp: number;
  private message: string;
  private userIds?: string[];
  private roomId?: string;

  constructor(message: string, timestamp: number, id?: string, userIds?: string[], roomId?: string) { 
    if (id && validateGUID(id)) {
      this._id = id
    } else {
      this._id = Guid.create().toString().toString();
    }

    this.message = message;
    this.timestamp = timestamp;
    this.userIds = userIds ? userIds : [];
    this.roomId = roomId;
  }

  public getId() {
    return this._id;
  }

  public getTimestamp() {
    return this.timestamp;
  }

  public getMessage() {
    return this.message;
  }

  public getUserIds() {
    return this.userIds;
  }

  public getRoomId() {
    return this.roomId;
  }

  public addUserId(userId: string) {
    this.userIds?.push(userId);
  }

  public setRoomId(roomId: string) {
    this.roomId = roomId;
  }

  public serialize() {
    return {
      _id: this._id.toString(),
      message: this.message,
      timestamp: this.timestamp,
      userIds: this.userIds,
      roomId: this.roomId
    };
  }

  public static deserialize(queryResult: any): Event {
    if (queryResult && queryResult._id && queryResult.timestamp && queryResult.message) { 
      return new Event(
        queryResult.message,
        queryResult.timestamp, 
        queryResult._id,
        queryResult.userIds ? queryResult.userIds : undefined,
        queryResult.roomId ? queryResult.roomId : undefined
      );
    }

    throw new DeserializationError("The provided query result is not a valid event.");
  }
}
