import { inject, injectable } from "tsyringe";
import DatabaseManager from "../Common/DatabaseManager.interface";
import Logger from "../Common/Logger.interface";
import { LogLevel } from "../Common/LogLevel.enum";
import Log from "../Models/Log";
import { DBCollections } from "../Common/DBCollections.enum";
import IController from "./IController.interface";

@injectable()
export default class LogController implements IController<Log, string> {
  constructor(
    @inject("DatabaseManager") private databaseManager: DatabaseManager,
    @inject("Logger") private logger: Logger
  ) { }

  public async create(modelObject: Log): Promise<boolean> {
    const createResult = await this.databaseManager.save(modelObject, DBCollections.LOGS);

    if (createResult) {
      this.logger.logToBoth(
        `Created log ${modelObject.getId()}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to create log ${modelObject.getId()}`,
        LogLevel.ERROR
      );
    }

    return createResult;
  }

  public async get(id: string): Promise<Log> {
    try {
      const returnLog = Log.deserialize(await this.databaseManager.get(id.toString(), DBCollections.LOGS));
  
      if (returnLog) {
        this.logger.logToBoth(
          `Retrieved log ${id}`,
          LogLevel.INFO
        );
  
        return returnLog;
      } else {
        this.logger.logToBoth(
          `Failed to retrieve log ${id}`,
          LogLevel.ERROR
        );
      }

      throw new Error('An unknown error occurred while getting the log');
    } catch (error) {
      throw error
    }
  }

  public async getWithFilter(filter: any): Promise<Log[]> {
    const serializedLogs = await this.databaseManager.getWithFilter(filter, DBCollections.LOGS);
    const deserializedLogs = serializedLogs.map(u => Log.deserialize(u));

    if (deserializedLogs) {
      this.logger.logToBoth(
        `Retrieved all logs`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to retrieve all logs`,
        LogLevel.ERROR
      );
    }

    return deserializedLogs;
  }

  public async getAll(): Promise<Log[]> {
    const serializedLogs = await this.databaseManager.getAll(DBCollections.LOGS);
    const deserializedLogs = serializedLogs.map(u => Log.deserialize(u));

    if (deserializedLogs) {
      this.logger.logToBoth(
        `Retrieved all logs`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to retrieve all logs`,
        LogLevel.ERROR
      );
    }

    return deserializedLogs;
  }

  public async update(oldModelObjectId: string, updatedModelObject: Log): Promise<boolean> {
    const updateResult = await this.databaseManager.update(oldModelObjectId.toString(), updatedModelObject, DBCollections.LOGS);

    if (updateResult) {
      this.logger.logToBoth(
        `Updated log ${oldModelObjectId}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to update log ${oldModelObjectId}`,
        LogLevel.ERROR
      );
    }

    return updateResult;
  }

  public async delete(modelObjectId: string): Promise<boolean> {
    const deleteResult = await this.databaseManager.delete(modelObjectId.toString(), DBCollections.LOGS);

    if (deleteResult) {
      this.logger.logToBoth(
        `Deleted log ${modelObjectId}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to delete log ${modelObjectId}`,
        LogLevel.ERROR
      );
    }

    return deleteResult;
  } 
} 
