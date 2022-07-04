import { Guid } from 'guid-typescript';
import { injectable } from 'tsyringe';
import Savable from '../Common/Savable.interface';
import DeserializationError from '../Errors/DeserializationError';
import validateGUID from '../Common/Util/GUIDValidator';

export interface ILocationFactory {
  create(latitude: number, longitude: number, timestamp: number, id?: string): Location;
}

@injectable()
export class LocationFactory implements ILocationFactory {
  public create = (latitude: number, longitude: number, timestamp: number, id?: string): Location => {
    return new Location(latitude, longitude, timestamp, id);
  }
}

export default class Location implements Savable {
  private _id: string;
  private latitude: number;
  private longitude: number;
  private timestamp: number;

  constructor(latitude: number, longitude: number, timestamp: number, id?: string) { 
    if (id && validateGUID(id)) {
      this._id = id
    } else {
      this._id = Guid.create().toString().toString();
    }
    
    this.latitude = latitude;
    this.longitude = longitude;
    this.timestamp = timestamp;
  }

  public getId() {
    return this._id;
  }

  public getLatitude() {
    return this.latitude;
  }

  public getLongitude() {
    return this.longitude;
  }

  public getTimestamp() {
    return this.timestamp;
  }

  public serialize() {
    return {
      _id: this._id.toString(),
      latitude: this.latitude,
      longitude: this.longitude,
      timestamp: this.timestamp,
    };
  }

  public static deserialize(queryResult: any): Location {
    if (queryResult && queryResult._id && queryResult.latitude && queryResult.longitude && queryResult.timestamp) { 
      return new Location(
        queryResult.latitude,
        queryResult.longitude,
        queryResult.timestamp,
        queryResult._id
      );
    }

    throw new DeserializationError("The provided query result is not a valid event.");
  }
}
