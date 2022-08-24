import { inject, injectable } from "tsyringe";
import DatabaseManager from "../Common/DatabaseManager.interface";
import Logger from "../Common/Logger.interface";
import { LogLevel } from "../Common/LogLevel.enum";
import { DBCollections } from "../Common/DBCollections.enum";
import IController from "./IController.interface";
import TextSurvey from "../Models/Survey";

@injectable()
export default class TextSurveyController implements IController<TextSurvey, string> {
  constructor(
    @inject("DatabaseManager") private databaseManager: DatabaseManager,
    @inject("Logger") private logger: Logger
  ) { }

  public async create(modelObject: TextSurvey): Promise<boolean> {
    const createResult = await this.databaseManager.save(modelObject, DBCollections.SURVEYS);

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

  public async get(id: string): Promise<TextSurvey> {
    try {
      const returnSurvey = TextSurvey.deserialize(await this.databaseManager.get(id.toString(), DBCollections.SURVEYS));
  
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

  public async getWithFilter(filter: any): Promise<TextSurvey[]> {
    const serializedSurveys = await this.databaseManager.getWithFilter(filter, DBCollections.SURVEYS);
    const deserializedSurveys = serializedSurveys.map(u => TextSurvey.deserialize(u));

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

  public async getAll(): Promise<TextSurvey[]> {
    const serializedSurveys = await this.databaseManager.getAll(DBCollections.SURVEYS);
    const deserializedSurveys = serializedSurveys.map(u => TextSurvey.deserialize(u));

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

  public async update(oldModelObjectId: string, updatedModelObject: TextSurvey): Promise<boolean> {
    const updateResult = await this.databaseManager.update(oldModelObjectId.toString(), updatedModelObject, DBCollections.SURVEYS);

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
    const deleteResult = await this.databaseManager.delete(modelObjectId.toString(), DBCollections.SURVEYS);

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
