import DatabaseManager from "../DatabaseManager.interface";
import Logger from "../Logger.interface";
import { Logger as ConsoleLogger } from "tslog";
import Log from "../../Models/Log";
import { LogLevel } from "../LogLevel.enum";
import { DBCollections } from "../DBCollections.enum";
import { inject, injectable } from "tsyringe";

@injectable()
export default class MongoLogger implements Logger {

  private consoleLogger: ConsoleLogger;

  constructor(
    @inject("DatabaseManager") private dbManager: DatabaseManager
  ) { 
    this.consoleLogger = new ConsoleLogger();
  }

  public logToConsole(message: string, logLevel: LogLevel, stack?: string): void {
    const log = new Log(message, logLevel, stack);
    switch (log.getLogLevel()) { 
      case LogLevel.ERROR:
        this.consoleLogger.error("", log);
        break;
      case LogLevel.WARNING:
        this.consoleLogger.warn(" ", log);
        break;
      case LogLevel.INFO:
        this.consoleLogger.info(" ", log);
        break;
    }
  };

  public logToDatabase(message: string, logLevel: LogLevel, stack?: string): void {
    const log = new Log(message, logLevel, stack);
    this.dbManager.save(log, DBCollections.LOGS);
  };

  public logToBoth(message: string, logLevel: LogLevel, stack?: string): void {
    this.logToConsole(message, logLevel, stack);
    this.logToDatabase(message, logLevel, stack);
  };
}
