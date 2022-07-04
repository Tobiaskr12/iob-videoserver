import express, { Request, Response } from "express";
import { container } from "tsyringe";
import Logger from "../Common/Logger.interface";
import { LogLevel } from "../Common/LogLevel.enum";
import validateGUID from "../Common/Util/GUIDValidator";
import LocationController from "../Controllers/LocationController";
import InvalidRequestError from "../Errors/InvalidRequestError";

const locationRouter = express.Router();
const logger: Logger = container.resolve('Logger');
const locationController: LocationController = container.resolve('LocationController');

// Get by id
locationRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.params.id) throw new InvalidRequestError('The request parameter "id" is required');
    if (!validateGUID(req.params.id)) throw new InvalidRequestError('The request parameter "id" is not a valid GUID');

    const location = await locationController.get(req.params.id);
    return res.status(200).json(location);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `LocationRoutes GET (/:id) - Internal server error: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send(error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `LocationRoutes GET (/:id) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.sendStatus(500);
  }
});

// Delete location
locationRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.params.id) throw new InvalidRequestError('The request parameter "id" is required');
    if (!validateGUID(req.params.id)) throw new InvalidRequestError('The request parameter "id" is not a valid GUID');

    const location = await locationController.get(req.params.id);
    await locationController.delete(location.getId());

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `LocationRoutes DELETE (/:id) - Internal server error: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send(error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `LocationRoutes DELETE (/:id) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.sendStatus(500);
  }
});

export default locationRouter;
