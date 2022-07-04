import { Guid } from "guid-typescript";
import { LogLevel } from "../Common/LogLevel.enum";
import Savable from "../Common/Savable.interface";
import DeserializationError from "../Errors/DeserializationError";
import validateGUID from "../Common/Util/GUIDValidator";
import { injectable } from "tsyringe";

export interface ILogFactory {
  create(message: string, logLevel: LogLevel, stack?: string, id?: string, timestamp?: number): Log;
}

@injectable()
export class LogFactory implements ILogFactory {
  public create = (message: string, logLevel: LogLevel, stack?: string, id?: string, timestamp?: number): Log => {
    return new Log(message, logLevel, stack, id, timestamp);
  }
}

export default class Log implements Savable {
  private _id: string;
  private message: string;
  private timestamp: number;
  private stack: string;
  private logLevel: LogLevel;

  constructor(message: string, logLevel: LogLevel, stack?: string, id?: string, timestamp?: number) {
    if (id && validateGUID(id)) {
      this._id = id
    } else {
      this._id = Guid.create().toString().toString();
    }
    
    this.message = message;
    this.logLevel = logLevel;
    this.stack = stack || "No Stack Trace";
    this.timestamp = timestamp || +(new Date());
  }

  public getId(): string {
    return this._id;
  }

  public getMessage(): string {
    return this.message;
  }

  public getTimestamp(): number {
    return this.timestamp;
  }

  public getStack(): string {
    return this.stack;
  }

  public getLogLevel(): LogLevel {
    return this.logLevel;
  }

  public serialize(): { [key: string]: any } {
    return {
      _id: this._id.toString(),
      message: this.message,
      logLevel: this.logLevel,
      stack: this.stack,
      timestamp: this.timestamp
    };
  }

  public static deserialize(queryResult: any): Log {
    if (queryResult && queryResult._id && queryResult.message && queryResult.timestamp && queryResult.stack && queryResult.logLevel) {
      return new Log(
        queryResult.message,
        queryResult.logLevel,
        queryResult.stack,
        queryResult._id,
        queryResult.timestamp
      );
    }

    throw new DeserializationError("The provided query result is not a valid event.");
  }
}
