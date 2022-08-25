import express, { Request, Response } from "express";
import { container } from "tsyringe";
import Logger from "../Common/Logger.interface";
import { LogLevel } from "../Common/LogLevel.enum";
import validateGUID from "../Common/Util/GUIDValidator";
import InvalidRequestError from "../Errors/InvalidRequestError";
import Telemetry, { TelemetryFactory } from "../Models/Telemetry";
import TelemetryController from './../Controllers/TelemetryController';

const telemetryRouter = express.Router();
const logger: Logger = container.resolve('Logger');
const telemetryController: TelemetryController = container.resolve('TelemetryController');
const telemetryFactory: TelemetryFactory = container.resolve('TelemetryFactory');

telemetryRouter.post('/', async (req: Request, res: Response) => {
   try {
    //if (!Array.isArray(req.body.results)) throw new Error('The request did not contain any results');
    //if (req.body.results.length != 3) throw new Error('The request did not contain exactly 3 results');
    //if (!req.body.experimentId) throw new Error('An experiment id was not provided');
    //
    console.log("results werw postsed " + JSON.stringify(req.body))

    const telemetryData = telemetryFactory.create(req.body.results.avgQLearnTime, req.body.results.avgComputationTime, req.body.results.avgEmotionAge);
    const isTelemetrySaved = await telemetryController.create(telemetryData);

    if (isTelemetrySaved) {
      return res.status(201).send("Telemetry data created successfully");
    } 

    throw new Error('Failed to create telemetry data');
   } catch (error) {
      if (error instanceof InvalidRequestError) {
         logger.logToBoth(
            `EventRoutes POST (/) - Internal server error: ${error.message}`,
            LogLevel.INFO,
            error.stack
         );

         return res.status(400).send(error.message);
      } else if (error instanceof Error) {
         logger.logToBoth(
            `EventRoutes POST (/) - Internal server error: ${error.message}`,
            LogLevel.ERROR,
            error.stack
         );
      }

      return res.sendStatus(500);
   }
});


export default telemetryRouter;
