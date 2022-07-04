import express, { Request, Response } from "express";
import { Guid } from "guid-typescript";
import { container } from "tsyringe";
import Logger from "../Common/Logger.interface";
import { LogLevel } from "../Common/LogLevel.enum";
import validateGUID from "../Common/Util/GUIDValidator";
import LogController from "../Controllers/LogController";
import InvalidRequestError from "../Errors/InvalidRequestError";
import Log from "../Models/Log";

const logRouter = express.Router();
const logger: Logger = container.resolve('Logger');
const logController: LogController = container.resolve('LogController');

// Get all logs
logRouter.get('/', async (req: Request, res: Response) => {
  try {
    const logs = await logController.getAll();
    return res.status(200).json(logs);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `LogRoutes GET (/) - Internal server error: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send(error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `LogRoutes GET (/) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

// Get by id
logRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.params.id) throw new InvalidRequestError('The request parameter "id" is required');
    if (!validateGUID(req.params.id)) throw new InvalidRequestError('The request parameter "id" is not a valid GUID');

    const log = await logController.get(req.params.id);
    return res.status(200).json(log);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `LogRoutes GET (/) - Internal server error: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send(error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `LogRoutes GET (/) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

// Get by time interval
logRouter.get('/interval', async (req: Request, res: Response) => {
  try {
    if (!req.query.startTime) throw new InvalidRequestError('The query parameter "startTime" is required');
    if (!req.query.endTime) throw new InvalidRequestError('The query parameter "endTime" is required');
    if (!(typeof req.query.startTime === "number")) throw new InvalidRequestError('The query parameter "startTime" must be a number');
    if (!(typeof req.query.endTime === "number")) throw new InvalidRequestError('The query parameter "endTime" must be a number');

    const returnArray: Log[] = [];
    const dbLogs = await logController.getWithFilter({
      timestamp: {
        $gte: req.query.startTime,
        $lte: req.query.endTime
      }
    });
    if (!dbLogs) throw new Error('An unknown error occurred while getting the logs');

    for (const log of dbLogs) {
      returnArray.push(Log.deserialize(log));
    }

    return res.status(200).json(returnArray);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `LogRoutes GET (/) - Internal server error: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send(error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `LogRoutes GET (/) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

export default logRouter;
