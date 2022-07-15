import { Guid } from "guid-typescript";
import { injectable } from "tsyringe";
import Savable from "../Common/Savable.interface";
import validateGUID from "../Common/Util/GUIDValidator";
import DeserializationError from "../Errors/DeserializationError";

export interface ISurveyFactory {
  create(answers: string[], userId: string, id?: string): Survey;
} 

@injectable()
export class SurveyFactory implements ISurveyFactory {
  public create = (answers: string[], userId: string, id?: string): Survey => {
    return new Survey(answers, userId, id);
  }
}

export default class Survey implements Savable {
  private _id: string;
  private answers: string[] = [];
  private userId: string;

  constructor(answers: string[], userId: string, id?: string) {
    if (id && validateGUID(id)) {
      this._id = id
    } else {
      this._id = Guid.create().toString().toString();
    }

    this.answers = answers;
    this.userId = userId;
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

  public serialize(): { [key: string]: any; } {

    console.log("SERIALIZE: ", this.answers, this.userId, this._id);
    return {
      _id: this._id,
      answers: this.answers,
      userId: this.userId,
    }
  }

  public static deserialize(queryResult: any): Survey {
    if (queryResult && queryResult._id && queryResult.answers && queryResult.userId) {
      return new Survey(queryResult.answers, queryResult.userId, queryResult._id)
    }

    throw new DeserializationError("The provided query result is not a valid survey object.");
  }
}