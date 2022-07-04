import { LogLevel } from "./LogLevel.enum";

export default interface Logger {
  logToConsole(message: string, logLevel: LogLevel, stack?: string): void;
  logToDatabase(message: string, logLevel: LogLevel, stack?: string): void;
  logToBoth(message: string, logLevel: LogLevel, stack?: string): void;
}