import { inject, injectable } from "tsyringe";
import DatabaseManager from "../Common/DatabaseManager.interface";
import Logger from "../Common/Logger.interface";
import { LogLevel } from "../Common/LogLevel.enum";
import Event from "../Models/Event";
import { DBCollections } from "../Common/DBCollections.enum";
import IController from "./IController.interface";
import { SocketService } from './../Services/SocketService';
import { app } from "..";

@injectable()
export default class EventController implements IController<Event, string> {
  constructor(
    @inject("DatabaseManager") private databaseManager: DatabaseManager,
    @inject("Logger") private logger: Logger
  ) { }

  public async create(modelObject: Event): Promise<boolean> {
    const createResult = await this.databaseManager.save(modelObject, DBCollections.EVENTS);

    if (createResult) {
      this.logger.logToBoth(
        `Created event ${modelObject.getId()}`,
        LogLevel.INFO
      );

      this.sendEventViaSocket(modelObject);
    } else {
      this.logger.logToBoth(
        `Failed to create event ${modelObject.getId()}`,
        LogLevel.ERROR
      );
    }

    return createResult;
  }

  public async get(id: string): Promise<Event> {
    try {
      const returnEvent = Event.deserialize(await this.databaseManager.get(id.toString(), DBCollections.EVENTS));
  
      if (returnEvent) {
        this.logger.logToBoth(
          `Retrieved event ${id}`,
          LogLevel.INFO
        );
  
        return returnEvent;
      } else {
        this.logger.logToBoth(
          `Failed to retrieve event ${id}`,
          LogLevel.ERROR
        );
      }

      throw new Error('An unknown error occurred while getting the event');
    } catch (error) {
      throw error
    }
  }

  public async getWithFilter(filter: any): Promise<Event[]> {
    const serializedEvents = await this.databaseManager.getWithFilter(filter, DBCollections.EVENTS);
    const deserializedEvents = serializedEvents.map(u => Event.deserialize(u));

    if (deserializedEvents) {
      this.logger.logToBoth(
        `Retrieved many events`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to retrieve many events`,
        LogLevel.ERROR
      );
    }

    return deserializedEvents;
  }

  public async getAll(): Promise<Event[]> {
    const serializedEvents = await this.databaseManager.getAll(DBCollections.EVENTS);
    const deserializedEvents = serializedEvents.map(u => Event.deserialize(u));

    if (deserializedEvents) {
      this.logger.logToBoth(
        `Retrieved all events`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to retrieve all events`,
        LogLevel.ERROR
      );
    }

    return deserializedEvents;
  }

  public async update(oldModelObjectId: string, updatedModelObject: Event): Promise<boolean> {
    const updateResult = await this.databaseManager.update(oldModelObjectId.toString(), updatedModelObject, DBCollections.EVENTS);

    if (updateResult) {
      this.logger.logToBoth(
        `Updated event ${oldModelObjectId}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to update event ${oldModelObjectId}`,
        LogLevel.ERROR
      );
    }

    return updateResult;
  }

  public async delete(modelObjectId: string): Promise<boolean> {
    const deleteResult = await this.databaseManager.delete(modelObjectId.toString(), DBCollections.EVENTS);

    if (deleteResult) {
      this.logger.logToBoth(
        `Deleted event ${modelObjectId}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to delete event ${modelObjectId}`,
        LogLevel.ERROR
      );
    }

    return deleteResult;
  } 

  private sendEventViaSocket(modelObject: Event) {
    const socketService: SocketService = app.get('socketService');
    const roomId = modelObject.getRoomId();
    const userIds = modelObject.getUserIds();

    if (roomId) {
      socketService.emitToRoom(
        'new-event',
        {
          message: modelObject.getMessage()
        },
        roomId
      );
    } else {
      throw new Error('An error prevented the event from being sent to the client');
    }
  }
} 
