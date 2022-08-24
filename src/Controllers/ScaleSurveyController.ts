import { inject, injectable } from "tsyringe";
import DatabaseManager from "../Common/DatabaseManager.interface";
import Logger from "../Common/Logger.interface";
import { LogLevel } from "../Common/LogLevel.enum";
import { DBCollections } from "../Common/DBCollections.enum";
import IController from "./IController.interface";
import ScaleSurvey from './../Models/ScaleSurvey';

@injectable()
export default class ScaleSurveyController implements IController<ScaleSurvey, string> {
  constructor(
    @inject("DatabaseManager") private databaseManager: DatabaseManager,
    @inject("Logger") private logger: Logger
  ) { }

  public async create(modelObject: ScaleSurvey): Promise<boolean> {
    const createResult = await this.databaseManager.save(modelObject, DBCollections.SCALE_SURVEYS);

    if (createResult) {
      this.logger.logToBoth(
        `Created survey ${modelObject.getId()}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to create survey ${modelObject.getId()}`,
        LogLevel.ERROR
      );
    }

    return createResult;
  }

  public async get(id: string): Promise<ScaleSurvey> {
    try {
      const returnSurvey = ScaleSurvey.deserialize(await this.databaseManager.get(id.toString(), DBCollections.SCALE_SURVEYS));
  
      if (returnSurvey) {
        this.logger.logToBoth(
          `Retrieved survey ${id}`,
          LogLevel.INFO
        );
  
        return returnSurvey;
      } else {
        this.logger.logToBoth(
          `Failed to retrieve survey ${id}`,
          LogLevel.ERROR
        );
      }

      throw new Error('An unknown error occurred while getting the survey');
    } catch (error) {
      throw error
    }
  }

  public async getWithFilter(filter: any): Promise<ScaleSurvey[]> {
    const serializedSurveys = await this.databaseManager.getWithFilter(filter, DBCollections.SCALE_SURVEYS);
    const deserializedSurveys = serializedSurveys.map(u => ScaleSurvey.deserialize(u));

    if (deserializedSurveys) {
      this.logger.logToBoth(
        `Retrieved all surveys`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to retrieve all surveys`,
        LogLevel.ERROR
      );
    }

    return deserializedSurveys;
  }

  public async getAll(): Promise<ScaleSurvey[]> {
    const serializedSurveys = await this.databaseManager.getAll(DBCollections.SCALE_SURVEYS);
    const deserializedSurveys = serializedSurveys.map(u => ScaleSurvey.deserialize(u));

    if (deserializedSurveys) {
      this.logger.logToBoth(
        `Retrieved all surveys`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to retrieve all surveys`,
        LogLevel.ERROR
      );
    }

    return deserializedSurveys;
  }

  public async update(oldModelObjectId: string, updatedModelObject: ScaleSurvey): Promise<boolean> {
    const updateResult = await this.databaseManager.update(oldModelObjectId.toString(), updatedModelObject, DBCollections.SCALE_SURVEYS);

    if (updateResult) {
      this.logger.logToBoth(
        `Updated survey ${oldModelObjectId}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to update survey ${oldModelObjectId}`,
        LogLevel.ERROR
      );
    }

    return updateResult;
  }

  public async delete(modelObjectId: string): Promise<boolean> {
    const deleteResult = await this.databaseManager.delete(modelObjectId.toString(), DBCollections.SCALE_SURVEYS);

    if (deleteResult) {
      this.logger.logToBoth(
        `Deleted survey ${modelObjectId}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to delete survey ${modelObjectId}`,
        LogLevel.ERROR
      );
    }

    return deleteResult;
  } 
} 
