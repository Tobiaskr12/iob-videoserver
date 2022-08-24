import { Guid } from "guid-typescript";
import { injectable } from "tsyringe";
import Savable from "../Common/Savable.interface";
import validateGUID from "../Common/Util/GUIDValidator";
import DeserializationError from "../Errors/DeserializationError";

export interface ITextSurveyFactory {
  create(answers: string[], userId: string, id?: string): TextSurvey;
} 

@injectable()
export class TextSurveyFactory implements ITextSurveyFactory {
  public create = (answers: string[], userId: string, id?: string): TextSurvey => {
    return new TextSurvey(answers, userId, id);
  }
}

export default class TextSurvey implements Savable {
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
    return {
      _id: this._id,
      answers: this.answers,
      userId: this.userId
    }
  }

  public static deserialize(queryResult: any): TextSurvey {
    if (queryResult && queryResult._id && queryResult.answers && queryResult.userId) {
      return new TextSurvey(queryResult.answers, queryResult.userId, queryResult._id)
    }

    throw new DeserializationError("The provided query result is not a valid survey object.");
  }
}