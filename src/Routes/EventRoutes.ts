import express, { Request, Response } from "express";
import { container } from "tsyringe";
import Logger from "../Common/Logger.interface";
import { LogLevel } from "../Common/LogLevel.enum";
import validateGUID from "../Common/Util/GUIDValidator";
import EventController from "../Controllers/EventController";
import UserController from "../Controllers/UserController";
import { EventFactory } from "../Models/Event";
import InvalidRequestError from './../Errors/InvalidRequestError';

const eventRouter = express.Router();
const logger: Logger = container.resolve('Logger');
const eventController: EventController = container.resolve('EventController');
const userController: UserController = container.resolve('UserController');
const eventFactory: EventFactory = container.resolve('EventFactory');

// Get all events
eventRouter.get('/', async (req: Request, res: Response) => {
  try {
    const events = await eventController.getAll();
    return res.status(200).json(events);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `EventRoutes GET (/) - Internal server error: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );
      
      return res.status(400).send(error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `EventRoutes GET (/) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.sendStatus(500);
  }
});

// Get by id
eventRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.params.id) throw new InvalidRequestError('The request parameter "id" is required');
    if (!(validateGUID(req.params.id))) throw new InvalidRequestError('The request parameter "id" is not a valid GUID');
    const event = await eventController.get(req.params.id);
    return res.status(200).json(event);
  } catch (error) {
    if (error instanceof InvalidRequestError) { 
      logger.logToBoth(
        `EventRoutes GET (/:id) - Internal server error: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send(error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `EventRoutes GET (/:id) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }
    
    return res.sendStatus(500);
  }
});

// Create event
eventRouter.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.body) throw new InvalidRequestError('The request body is empty');
    if (!req.body.message) throw new InvalidRequestError('The request body is missing the "message" property');
    if (!req.body.timestamp) throw new InvalidRequestError('The request body is missing the "timestamp" property');
    if (!req.body.roomId) throw new InvalidRequestError('The request body is missing the "roomId" property');

    const event = eventFactory.create(
      req.body.message,
      +(req.body.timestamp),
      req.body.id, 
      req.body.userId ? req.body.userId : undefined,
      req.body.roomId
    );
    const eventSavedResult = await eventController.create(event);

    if (eventSavedResult) { 
      return res.status(201).send({
        id: event.getId()
      });
    }
    
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


// Create an event and associate it with many users
eventRouter.post('/add-to-many-users', async (req: Request, res: Response) => {
  try {
    if (!req.body) throw new InvalidRequestError('The request body is empty');
    if (!req.body.message) throw new InvalidRequestError('The request body is missing the "message" property');
    if (!req.body.timestamp) throw new InvalidRequestError('The request body is missing the "timestamp" property');
    if (!req.body.userIds) throw new InvalidRequestError('The request body is missing the "userIds" property');
    if (!Array.isArray(req.body.userIds)) throw new InvalidRequestError('The request body "userIds" property is not an array');
    if (!req.body.roomId) throw new InvalidRequestError('The request body is missing the "roomId" property');

    const event = eventFactory.create(
      req.body.message,
      +(req.body.timestamp),
      req.body.id,
      req.body.userIds,
      req.body.roomId
    );

    const users = await userController.getWithFilter({ _id: { $in: req.body.userIds } });

    for (const user of users) {
      if (!(validateGUID(user.getId()))) throw new InvalidRequestError('"UserIds" contains an invalid GUID');

      event.addUserId(user.getId());
      user.addEvent(event.getId());
      const userUpdatedResult = await userController.update(user.getId(), user);
      if (!userUpdatedResult) throw new Error('Failed to update user');
    }

    const eventSavedResult = await eventController.create(event);

    if (eventSavedResult) {
      return res.status(201).send({
        id: event.getId()
      });
    }
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `EventRoutes POST (/add-to-many-users) - Internal server error: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send(error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `EventRoutes POST (/add-to-many-users) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }
    
    return res.sendStatus(500);
  }
});


export default eventRouter;
