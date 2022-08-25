import { inject, injectable } from "tsyringe";
import DatabaseManager from "../Common/DatabaseManager.interface";
import Logger from "../Common/Logger.interface";
import { LogLevel } from "../Common/LogLevel.enum";
import { DBCollections } from "../Common/DBCollections.enum";
import IController from "./IController.interface";
import Telemetry from "../Models/Telemetry";

@injectable()
export default class TelemetryController implements IController<Telemetry, string> {
  constructor(
    @inject("DatabaseManager") private databaseManager: DatabaseManager,
    @inject("Logger") private logger: Logger
  ) { }

  public async create(modelObject: Telemetry): Promise<boolean> {
    const createResult = await this.databaseManager.save(modelObject, DBCollections.TELEMETRY);

    if (createResult) {
      this.logger.logToBoth(
        `Created telemetry ${modelObject.getId()}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to create telemetry ${modelObject.getId()}`,
        LogLevel.ERROR
      );
    }

    return createResult;
  }

  public async get(id: string): Promise<Telemetry> {
    try {
      const returnTelemetry = Telemetry.deserialize(await this.databaseManager.get(id.toString(), DBCollections.TELEMETRY));
  
      if (returnTelemetry) {
        this.logger.logToBoth(
          `Retrieved telemetry ${id}`,
          LogLevel.INFO
        );
  
        return returnTelemetry;
      } else {
        this.logger.logToBoth(
          `Failed to retrieve telemetry ${id}`,
          LogLevel.ERROR
        );
      }

      throw new Error('An unknown error occurred while getting the telemetry');
    } catch (error) {
      throw error
    }
  }

  public async getWithFilter(filter: any): Promise<Telemetry[]> {
    const serializedTelemetrys = await this.databaseManager.getWithFilter(filter, DBCollections.TELEMETRY);
    const deserializedTelemetrys = serializedTelemetrys.map(u => Telemetry.deserialize(u));

    if (deserializedTelemetrys) {
      this.logger.logToBoth(
        `Retrieved all telemetrys`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to retrieve all telemetrys`,
        LogLevel.ERROR
      );
    }

    return deserializedTelemetrys;
  }

  public async getAll(): Promise<Telemetry[]> {
    const serializedTelemetrys = await this.databaseManager.getAll(DBCollections.TELEMETRY);
    const deserializedTelemetrys = serializedTelemetrys.map(u => Telemetry.deserialize(u));

    if (deserializedTelemetrys) {
      this.logger.logToBoth(
        `Retrieved all telemetrys`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to retrieve all telemetrys`,
        LogLevel.ERROR
      );
    }

    return deserializedTelemetrys;
  }

  public async update(oldModelObjectId: string, updatedModelObject: Telemetry): Promise<boolean> {
    const updateResult = await this.databaseManager.update(oldModelObjectId.toString(), updatedModelObject, DBCollections.TELEMETRY);

    if (updateResult) {
      this.logger.logToBoth(
        `Updated telemetry ${oldModelObjectId}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to update telemetry ${oldModelObjectId}`,
        LogLevel.ERROR
      );
    }

    return updateResult;
  }

  public async delete(modelObjectId: string): Promise<boolean> {
    const deleteResult = await this.databaseManager.delete(modelObjectId.toString(), DBCollections.TELEMETRY);

    if (deleteResult) {
      this.logger.logToBoth(
        `Deleted telemetry ${modelObjectId}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to delete telemetry ${modelObjectId}`,
        LogLevel.ERROR
      );
    }

    return deleteResult;
  } 
} 
