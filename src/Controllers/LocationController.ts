import { inject, injectable } from "tsyringe";
import DatabaseManager from "../Common/DatabaseManager.interface";
import Logger from "../Common/Logger.interface";
import { LogLevel } from "../Common/LogLevel.enum";
import Location from "../Models/Location";
import { DBCollections } from "../Common/DBCollections.enum";
import IController from "./IController.interface";

@injectable()
export default class LocationController implements IController<Location, string> {
  constructor(
    @inject("DatabaseManager") private databaseManager: DatabaseManager,
    @inject("Logger") private logger: Logger
  ) { }

  public async create(modelObject: Location): Promise<boolean> {
    const createResult = await this.databaseManager.save(modelObject, DBCollections.LOCATIONS);

    if (createResult) {
      this.logger.logToBoth(
        `Created location ${modelObject.getId()}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to create location ${modelObject.getId()}`,
        LogLevel.ERROR
      );
    }

    return createResult;
  }

  public async get(id: string): Promise<Location> {
    try {
      const returnLocation = Location.deserialize(await this.databaseManager.get(id.toString(), DBCollections.LOCATIONS));
  
      if (returnLocation) {
        this.logger.logToBoth(
          `Retrieved location ${id}`,
          LogLevel.INFO
        );
  
        return returnLocation;
      } else {
        this.logger.logToBoth(
          `Failed to retrieve location ${id}`,
          LogLevel.ERROR
        );
      }

      throw new Error('An unknown error occurred while getting the location');
    } catch (error) {
      throw error
    }
  }

  public async getWithFilter(filter: any): Promise<Location[]> {
    const serializedLocations = await this.databaseManager.getWithFilter(filter, DBCollections.LOCATIONS);
    const deserializedLocations = serializedLocations.map(u => Location.deserialize(u));

    if (deserializedLocations) {
      this.logger.logToBoth(
        `Retrieved all locations`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to retrieve all locations`,
        LogLevel.ERROR
      );
    }

    return deserializedLocations;
  }

  public async getAll(): Promise<Location[]> {
    const serializedLocations = await this.databaseManager.getAll(DBCollections.LOCATIONS);
    const deserializedLocations = serializedLocations.map(u => Location.deserialize(u));

    if (deserializedLocations) {
      this.logger.logToBoth(
        `Retrieved all locations`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to retrieve all locations`,
        LogLevel.ERROR
      );
    }

    return deserializedLocations;
  }

  public async update(oldModelObjectId: string, updatedModelObject: Location): Promise<boolean> {
    const updateResult = await this.databaseManager.update(oldModelObjectId.toString(), updatedModelObject, DBCollections.LOCATIONS);

    if (updateResult) {
      this.logger.logToBoth(
        `Updated location ${oldModelObjectId}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to update location ${oldModelObjectId}`,
        LogLevel.ERROR
      );
    }

    return updateResult;
  }

  public async delete(modelObjectId: string): Promise<boolean> {
    const deleteResult = await this.databaseManager.delete(modelObjectId.toString(), DBCollections.LOCATIONS);

    if (deleteResult) {
      this.logger.logToBoth(
        `Deleted location ${modelObjectId}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to delete location ${modelObjectId}`,
        LogLevel.ERROR
      );
    }

    return deleteResult;
  } 
} 
