import { inject, injectable } from "tsyringe";
import DatabaseManager from "../Common/DatabaseManager.interface";
import Logger from "../Common/Logger.interface";
import { LogLevel } from "../Common/LogLevel.enum";
import User from "../Models/User";
import { DBCollections } from "../Common/DBCollections.enum";
import IController from "./IController.interface";

@injectable()
export default class UserController implements IController<User, string> {
  constructor(
    @inject("DatabaseManager") private databaseManager: DatabaseManager,
    @inject("Logger") private logger: Logger
  ) { }

  public async create(modelObject: User): Promise<boolean> {
    const createResult = await this.databaseManager.save(modelObject, DBCollections.USERS);

    if (createResult) {
      this.logger.logToBoth(
        `Created user ${modelObject.getId()}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to create user ${modelObject.getId()}`,
        LogLevel.ERROR
      );
    }

    return createResult;
  }

  public async get(id: string): Promise<User> {
    try {
      const returnUser = User.deserialize(await this.databaseManager.get(id.toString(), DBCollections.USERS));
  
      if (returnUser) {
        this.logger.logToBoth(
          `Retrieved user ${id}`,
          LogLevel.INFO
        );
  
        return returnUser;
      } else {
        this.logger.logToBoth(
          `Failed to retrieve user ${id}`,
          LogLevel.ERROR
        );
      }

      throw new Error('An unknown error occurred while getting the user');
    } catch (error) {
      throw error
    }
  }

  public async getWithFilter(filter: any): Promise<User[]> {
    const serializedUsers = await this.databaseManager.getWithFilter(filter, DBCollections.USERS);
    const deserializedUsers = serializedUsers.map(u => User.deserialize(u));

    if (deserializedUsers) {
      this.logger.logToBoth(
        `Retrieved all users`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to retrieve all users`,
        LogLevel.ERROR
      );
    }

    return deserializedUsers;
  }

  public async getAll(): Promise<User[]> {
    const serializedUsers = await this.databaseManager.getAll(DBCollections.USERS);
    const deserializedUsers = serializedUsers.map(u => User.deserialize(u));

    if (deserializedUsers) {
      this.logger.logToBoth(
        `Retrieved all users`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to retrieve all users`,
        LogLevel.ERROR
      );
    }

    return deserializedUsers;
  }

  public async update(oldModelObjectId: string, updatedModelObject: User): Promise<boolean> {
    const updateResult = await this.databaseManager.update(oldModelObjectId.toString(), updatedModelObject, DBCollections.USERS);

    if (updateResult) {
      this.logger.logToBoth(
        `Updated user ${oldModelObjectId}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to update user ${oldModelObjectId}`,
        LogLevel.ERROR
      );
    }

    return updateResult;
  }

  public async delete(modelObjectId: string): Promise<boolean> {
    const deleteResult = await this.databaseManager.delete(modelObjectId.toString(), DBCollections.USERS);

    if (deleteResult) {
      this.logger.logToBoth(
        `Deleted user ${modelObjectId}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to delete user ${modelObjectId}`,
        LogLevel.ERROR
      );
    }

    return deleteResult;
  } 
} 
