import { Guid } from "guid-typescript";
import { injectable } from "tsyringe";
import Savable from "../Common/Savable.interface";
import validateGUID from "../Common/Util/GUIDValidator";
import DeserializationError from "../Errors/DeserializationError";

export interface ISurveyFactory {
  create(answers: string[], userId: string, experimentId: number, id?: string): Survey;
} 

@injectable()
export class SurveyFactory implements ISurveyFactory {
  public create = (answers: string[], userId: string, experimentId: number, id?: string): Survey => {
    return new Survey(answers, userId, experimentId, id);
  }
}

export default class Survey implements Savable {
  private _id: string;
  private answers: string[] = [];
  private userId: string;
  private experimentId: number;

  constructor(answers: string[], userId: string, experimentId: number, id?: string) {
    if (id && validateGUID(id)) {
      this._id = id
    } else {
      this._id = Guid.create().toString().toString();
    }

    this.answers = answers;
    this.userId = userId;
    this.experimentId = experimentId;
  }

  public getId(): string {
    return this._id;
  }

  public getAnswers(): string[] {
    return this.answers;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getExperimentId(): number {
    return this.experimentId;
  }

  public serialize(): { [key: string]: any; } {

    console.log("SERIALIZE: ", this.answers, this.userId, this._id);
    return {
      _id: this._id,
      answers: this.answers,
      userId: this.userId,
      experimentId: this.experimentId
    }
  }

  public static deserialize(queryResult: any): Survey {
    if (queryResult && queryResult._id && queryResult.answers && queryResult.userId && queryResult.experimentId) {
      return new Survey(queryResult.answers, queryResult.userId, queryResult.experimentId, queryResult._id)
    }

    throw new DeserializationError("The provided query result is not a valid survey object.");
  }
}