import { Guid } from 'guid-typescript';
import { injectable } from 'tsyringe';
import Savable from '../Common/Savable.interface';
import validateGUID from '../Common/Util/GUIDValidator';
import DeserializationError from '../Errors/DeserializationError';

export interface IUserFactory {
  create(connectedTime: number, id?: string, locationHistory?: string[], eventHistory?: string[], videoIds?: string[], disconnectedTime?: number): User;
}

@injectable()
export class UserFactory implements IUserFactory { 
  public create = (connectedTime: number, id?: string, locationHistory?: string[], eventHistory?: string[], videoIds?: string[], disconnectedTime?: number): User => {
    return new User(connectedTime, id, locationHistory, eventHistory, videoIds, disconnectedTime);
  }
}

const possibleDestinations = ['A', 'B', 'C', 'D'];

const getRandomDestination = (): 'A' | 'B' | 'C' | 'D' => { 
  const randomIndex = Math.floor(Math.random() * 4);

  switch (randomIndex) {
    case 0:
      return 'A';
    case 1:
      return 'B';
    case 2:
      return 'C';
    case 3:
      return 'D';
    default:
      throw new Error('Invalid random index');
  }
}

type UserLocation = {
  lat: number;
  lng: number;
} | undefined

export default class User implements Savable {
  private _id: string;
  private locationHistory: string[];
  private eventHistory: string[];
  private connectedTime: number;
  private disconnectedTime?: number;
  private videoIds?: string[];
  private destination: 'A' | 'B' | 'C' | 'D';
  private location: UserLocation;
  private experimentConclusionEmotions: {
    expression: string;
    probability: number;
  }[][] = [];

  constructor(
    connectedTime: number,
    id?: string,
    locationHistory?: string[], 
    eventHistory?: string[],
    videoIds?: string[],
    disconnectedTime?: number,
    experimentConclusionEmotion?: {
      expression: string;
      probability: number;
    }[][]
  ) {
    if (id && validateGUID(id)) {
      this._id = id
    } else {
      this._id = Guid.create().toString().toString();
    }
    
    this.locationHistory = locationHistory || [];
    this.eventHistory = eventHistory || [];
    this.connectedTime = connectedTime;
    this.disconnectedTime = disconnectedTime || undefined;
    this.videoIds = videoIds || undefined;
    this.destination = getRandomDestination();
    this.location = undefined;
    this.experimentConclusionEmotions = experimentConclusionEmotion || [];
  }

  public addLocation(locationId: string) {
    this.locationHistory.push(locationId);
  }

  public addEvent(eventId: string) {
    this.eventHistory.push(eventId);
  }

  public addVideo(videoId: string) {
    if (Array.isArray(this.videoIds)) {
      this.videoIds.push(videoId);
    } else {
      this.videoIds = [videoId];
    }
  }

  public addExperimentConclusionEmotions(emotionArray: {
    expression: string;
    probability: number;
  }[]) {
    this.experimentConclusionEmotions.push(emotionArray);
  }

  public getId(): string {
    return this._id;
  }

  public getLocationHistory(): string[] {
    return this.locationHistory;
  }

  public getEventHistory(): string[] {
    return this.eventHistory;
  }

  public getVideoId(): string[] | undefined {
    return this.videoIds;
  }

  public getConnectedTime(): number {
    return this.connectedTime;
  }

  public getDisconnectedTime(): number | undefined {
    return this.disconnectedTime;
  }

  public getExperimentConclusionEmotions(): {
    expression: string;
    probability: number;
  }[][] {
    return this.experimentConclusionEmotions;
  }

  public getConnectionDuration(): number {
    if (this.disconnectedTime) {
      return this.disconnectedTime - this.connectedTime;
    }

    throw new Error("Connection duration cannot be calculated because the user has not disconnected yet.");
  }

  public getDestination(): 'A' | 'B' | 'C' | 'D' {
    return this.destination;
  }

  public getLocation(): UserLocation { 
    return this.location;
  }

  public setVideoIds(videoIds: string[]) {
    this.videoIds = videoIds;
  }

  public setDisconnectedTime(disconnectedTime: number) {
    this.disconnectedTime = disconnectedTime;
  }

  public setDestination(destination: 'A' | 'B' | 'C' | 'D') {
    this.destination = destination;
  }

  public setLocation(location: UserLocation) {
    this.location = location;
  }

  public serialize() {
    return {
      _id: this._id.toString(),
      locationHistory: this.locationHistory.map(locationId => locationId.toString()),
      eventHistory: this.eventHistory.map(eventId => eventId.toString()),
      videoIds: this.videoIds,
      connectedTime: this.connectedTime,
      disconnectedTime: this.disconnectedTime,
      experimentConclusionEmotions: this.experimentConclusionEmotions
    };
  }

  public static deserialize(queryResult: any): User {
    if (
      queryResult && 
      queryResult._id &&
      queryResult.connectedTime
    ) { 
      return new User(
        queryResult.connectedTime,
        queryResult._id,
        queryResult.locationHistory ? queryResult.locationHistory.map((locationId: string) => Guid.parse(locationId)) : [],
        queryResult.eventHistory ? queryResult.eventHistory.map((eventId: string) => Guid.parse(eventId)) : [],
        queryResult.videoIds ? queryResult.videoIds : undefined,
        queryResult.disconnectedTime ? queryResult.disconnectedTime : undefined,
        queryResult.experimentConclusionEmotions ? queryResult.experimentConclusionEmotions : undefined
      );
    }

    throw new DeserializationError("The provided query result is not a valid user.");
  }
}
