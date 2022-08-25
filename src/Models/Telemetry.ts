import { Guid } from "guid-typescript";
import { injectable } from "tsyringe";
import Savable from "../Common/Savable.interface";
import validateGUID from "../Common/Util/GUIDValidator";
import DeserializationError from "../Errors/DeserializationError";

export interface ITelemetryFactory {
  create(avgQLearnTime: number, avgComputationTime: number, avgEmotionAge: number): Telemetry;
} 

@injectable()
export class TelemetryFactory implements ITelemetryFactory {
  public create = (avgQLearnTime: number, avgComputationTime: number, avgEmotionAge: number): Telemetry => {
    return new Telemetry(avgQLearnTime, avgComputationTime, avgEmotionAge);
  }
}

export default class Telemetry implements Savable {
  private _id: string;
  private avgQLearnTime: number;
  private avgComputationTime: number;
  private avgEmotionAge: number;

  constructor(avgQLearnTime : number, avgComputationTime : number, avgEmotionAge : number, id? : string ) {
    if (id && validateGUID(id)) {
      this._id = id
    } else {
      this._id = Guid.create().toString().toString();
    }

    this.avgQLearnTime = avgQLearnTime;
    this.avgComputationTime = avgComputationTime;
    this.avgEmotionAge = avgEmotionAge;
  }

  public getId(): string {
    return this._id;
  }

  public getAnswers(): number {
    return this.avgQLearnTime;
  }

  public getUserId(): number {
    return this.avgComputationTime;
  }

  public getExperimentId(): number {
    return this.avgEmotionAge;
  }

  public serialize(): { [key: string]: any; } {

    return {
      _id: this._id,
      avgQLearnTime: this.avgQLearnTime,
      avgComputationTime: this.avgComputationTime,
      avgEmotionAge: this.avgEmotionAge
    }
  }

  public static deserialize(queryResult: any): Telemetry {
    if (queryResult && queryResult._id && queryResult.avgQLearnTime && queryResult.avgComputationTime && queryResult.avgEmotionAge) {
      return new Telemetry(queryResult.avgQLearnTime, queryResult.avgComputationTime, queryResult.avgEmotionAge, queryResult._id)
    }

    throw new DeserializationError("The provided query result is not a valid survey object.");
  }
}
