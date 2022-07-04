import { Db } from 'mongodb';
import { injectable } from 'tsyringe';
import Savable from '../Common/Savable.interface';
import { app } from '../index';
import Event from '../Models/Event';
import Location from '../Models/Location';
import Log from '../Models/Log';
import User from '../Models/User';
import Video from '../Models/Video';
import { DBCollections } from '../Common/DBCollections.enum';
import DatabaseManager from './../Common/DatabaseManager.interface';
import PersistenceError from './../Errors/PersistenceError';

@injectable()
export default class MongoDbmanager implements DatabaseManager {
  private db: Db;

  constructor() {
    this.db = app.get('database');
  }

  public async save(object: Savable, dbCollection: DBCollections): Promise<boolean> {
    try {
      this.setDb();
      const insertResult = await this.db.collection(dbCollection).insertOne(object.serialize());

      return insertResult.acknowledged;
    } catch(error) {
      throw new PersistenceError('An error occurred while saving to the database:' + error);
    }
  }

  public async saveMany(objects: Savable[], dbCollection: DBCollections): Promise<boolean> {
    try {
      this.setDb();
      const insertResult = await this.db.collection(dbCollection).insertMany(objects.map(o => o.serialize()));

      if (insertResult.insertedCount !== objects.length) {
        throw new PersistenceError(`Not all objects were saved to the database. ${insertResult.insertedCount}/${objects.length} objects were saved.`);
      };

      return true;
    } catch(error) {

      throw new PersistenceError('An error occurred while saving to the database');
    }
  }

  public async get(id: string, dbCollection: DBCollections): Promise<Savable> {
    try {
      this.setDb();
      const queryResult = await this.db.collection(dbCollection).findOne({ _id: id });

      
      if (!queryResult) { 
        throw new PersistenceError(`No object with id ${id} was found in the database.`);
      }
      
      const resultObject = await this.createModelObjectFromQueryResult(queryResult, dbCollection);

      if (resultObject) {
        return resultObject
      }

      throw new PersistenceError('An error occurred while getting an object from the database.');
    } catch (error) {
      throw new PersistenceError('An error occurred while getting an object from the database.');
    }
  }

  public async getWithFilter(filter: any, dbCollection: DBCollections): Promise<Savable[]> {
    try {
      this.setDb();
      const resultArray = [];
      const queryResult = await this.db.collection(dbCollection).find(filter).toArray();

      if (!queryResult) {
        throw new PersistenceError(`No objects were found in the database.`);
      }
 
      for (let i = 0; i < queryResult.length; i++) {
        resultArray.push(await this.createModelObjectFromQueryResult(queryResult[i], dbCollection));
      }

      if (resultArray.length > 0) {
        return resultArray;
      }

      throw new PersistenceError(`No objects were found in the database.`);
    } catch (error) {
      throw new PersistenceError(`An error occurred while getting objects from the database.`);
    }
  }

  public async getMany(ids: string[], dbCollection: DBCollections): Promise<Savable[]> {
    try {
      this.setDb();
      const resultArray = [];
      const queryResult = await this.db.collection(dbCollection).find({ _id: { $in: ids } }).toArray();

      if (!queryResult) { 
        throw new PersistenceError(`No objects with ids ${ids} were found in the database.`);
      }

      for (let i = 0; i < queryResult.length; i++) {
        resultArray.push(await this.createModelObjectFromQueryResult(queryResult[i], dbCollection));
      }

      if (resultArray.length > 0) {
        return resultArray
      }

      throw new PersistenceError('An error occurred while getting objects from the database.');
    } catch (error) {
      throw new PersistenceError('An error occurred while getting objects from the database.');
    }
  }

  public async getAll(dbCollection: DBCollections): Promise<Savable[]> {
    try {
      this.setDb();
      const queryResult = await this.db.collection(dbCollection).find({}).toArray();
      
      if (!queryResult) { 
        throw new PersistenceError(`No objects were found in the database.`);
      }
      
      const resultArray = [];
      for (let i = 0; i < queryResult.length; i++) {
        console.log(queryResult[i]);
        resultArray.push(await this.createModelObjectFromQueryResult(queryResult[i], dbCollection));
      }

      if (resultArray.length > 0) {
        return resultArray
      }

      throw new PersistenceError('An error occurred while getting objects from the database.');
    } catch (error) {
      throw new PersistenceError('An error occurred while getting objects from the database.');
    }
  }

  public async update(id: string, object: Savable, dbCollection: DBCollections): Promise<boolean> {
    try {
      this.setDb();
      const updateResult = await this.db.collection(dbCollection).updateOne({ _id: id }, { $set: object.serialize() });

      if (updateResult.modifiedCount === 1) {
        return true
      }

      throw new PersistenceError(`An error occurred while updating the object with id ${id} in the database.`);
    } catch (error) {
      return false;
    }
  }

  public async delete(id: string, dbCollection: DBCollections): Promise<boolean> {
    try {
      this.setDb();
      const deleteResult = await this.db.collection(dbCollection).deleteOne({ _id: id });

      if (deleteResult.deletedCount === 1) {
        return true
      }

      throw new PersistenceError(`An error occurred while deleting the object with id ${id} from the database.`);
    } catch (error) {
      return false;
    }
  }

  public async deleteAll(dbCollection: DBCollections): Promise<boolean> { 
    try {
      this.setDb();
      const deleteResult = await this.db.collection(dbCollection).deleteMany({});

      if (deleteResult.deletedCount > 0) {
        return true
      }

      throw new PersistenceError(`An error occurred while deleting all objects from the database.`);
    } catch (error) {
      return false;
    }
  }

  private async createModelObjectFromQueryResult(queryResult: any, dbCollection: DBCollections): Promise<Savable> { 
    console.log(queryResult)
    switch (dbCollection) {
      case DBCollections.EVENTS:
        return Event.deserialize(queryResult);
      case DBCollections.USERS:
        return User.deserialize(queryResult);
      case DBCollections.LOCATIONS:
        return Location.deserialize(queryResult);
      case DBCollections.LOGS:
        return Log.deserialize(queryResult);
      case DBCollections.VIDEOS:
        return Video.deserialize(queryResult);
      default:
        break;
    }

    throw new Error('Unknown database collection');
  }

  private setDb() {
    if (!this.db) {
      this.db = app.get('database');
    }
  }
}
