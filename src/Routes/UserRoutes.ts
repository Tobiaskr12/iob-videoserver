import express, { Request, Response } from "express";
import { container } from "tsyringe";
import Logger from "../Common/Logger.interface";
import validateGUID from "../Common/Util/GUIDValidator";
import { EventFactory } from "../Models/Event";
import { LocationFactory } from "../Models/Location";
import { UserFactory } from "../Models/User";
import UserController from './../Controllers/UserController';
import InvalidRequestError from './../Errors/InvalidRequestError';
import { LogLevel } from "../Common/LogLevel.enum";
import LocationController from "../Controllers/LocationController";
import EventController from "../Controllers/EventController";
import VideoController from './../Controllers/VideoController';
import { app } from "..";
import { SocketService } from "../Services/SocketService";
import convertDestinationToLocation from "../Common/Util/DestinationConverter";

const userRouter = express.Router();
const logger: Logger = container.resolve('Logger');
const userController: UserController = container.resolve('UserController');
const locationController: LocationController = container.resolve('LocationController');
const eventController: EventController = container.resolve('EventController');
const videoController: VideoController = container.resolve('VideoController');
const userFactory: UserFactory = container.resolve('UserFactory');
const locationFactory: LocationFactory = container.resolve('LocationFactory');
const eventFactory: EventFactory = container.resolve('EventFactory');

// Get all
userRouter.get('/', async (req: Request, res: Response) => {
  try {
    const users = await userController.getAll();
    return res.status(200).send(users);
  } catch (error) {
    if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes GET (/) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

// Get connected users
userRouter.get('/connected', async (req: Request, res: Response) => {
  try {
    const users = await userController.getAll();
    const connectedUsers = users.filter(user => user.getDisconnectedTime() === undefined);
  
    return res.status(200).send(connectedUsers);
  } catch (error) {
    if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes GET (/connected) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

// Get disconnected users
userRouter.get('/disconnected', async (req: Request, res: Response) => { 
  try {
    const users = await userController.getAll();
    const disconnectedUsers = users.filter(user => user.getDisconnectedTime() !== undefined);
  
    return res.status(200).send(disconnectedUsers);
  } catch (error) {
    if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes GET (/disconnected) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

// Connect user
userRouter.post('/connect', async (req: Request, res: Response) => {
  try {
    if (!req.body.connectedTime) throw new InvalidRequestError('The required parameter "connectedTime" is missing');
    if (!(typeof req.body.connectedTime === 'number')) throw new InvalidRequestError('The parameter "connectedTime" is not a valid number');
  
    const user = userFactory.create(req.body.connectedTime);
  
    const saveResult = await userController.create(user);
    if (!saveResult) throw new Error('Failed to save user');

    const socketService: SocketService = app.get('socketService');
    socketService.emitToRoom(
      'user-connected',
      {

      },
      'admin'
    );
  
    return res.status(201).send({
      userId: user.getId()
    });
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `UserRoutes POST (/connect) - Invalid request: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send('Request failed: ' + error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes POST (/connect) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

// Disconnect user
userRouter.post('/:user_id/disconnect', async (req: Request, res: Response) => {
  try {
    if (!req.params.user_id) throw new InvalidRequestError('The required parameter "user_id" is missing');
    if (!validateGUID(req.params.user_id)) throw new InvalidRequestError('The parameter "user_id" is not a valid GUID');
    if (!req.body.disconnectedTIme) throw new InvalidRequestError('The required parameter "disconnectedTIme" is missing');
    if (!(typeof req.body.disconnectedTIme === 'number')) throw new InvalidRequestError('The parameter "disconnectedTIme" is not a valid number');
  
    const user = await userController.get(req.params.user_id);
    if (!user) throw new Error('User not found');
  
    user.setDisconnectedTime(req.body.disconnectedTIme);
    const updateResult = await userController.update(user.getId(), user);

    if (!updateResult) throw new Error('Failed to update user');

    const socketService: SocketService = app.get('socketService');
    socketService.emitToRoom(
      'user-disconnected',
      {

      },
      'admin'
    );
  
    return res.status(200).send({
      userId: user.getId(),
    });
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `UserRoutes POST (/:user_id/disconnect) - Invalid request: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send('Request failed: ' + error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes POST (/:user_id/disconnect) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

// Add location to user
userRouter.post('/:user_id/locations', async (req: Request, res: Response) => {
  try {
    if (!req.params.user_id) throw new InvalidRequestError('The required parameter "user_id" is missing');
    if (!validateGUID(req.params.user_id)) throw new InvalidRequestError('The parameter "user_id" is not a valid GUID');
    if (!req.body.longitude) throw new InvalidRequestError('The required parameter "longitude" is missing');
    if (!req.body.latitude) throw new InvalidRequestError('The required parameter "latitude" is missing');
    if (!req.body.timestamp) throw new InvalidRequestError('The required parameter "timestamp" is missing');
  
    const user = await userController.get(req.params.user_id);
    if (!user) throw new Error('User not found');
  
    const location = locationFactory.create(req.body.longitude, req.body.latitude, req.body.timestamp);
    user.addLocation(location.getId());

    const isLocationCreated = await locationController.create(location);
    if (!isLocationCreated) throw new Error('Failed to save location');

    const updateResult = await userController.update(user.getId(), user);
    if (!updateResult) throw new Error('Failed to update user');
  
    return res.status(201).send({
      userId: user.getId(),
      locationId: location.getId()
    });
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `UserRoutes POST (/:user_id/locations) - Invalid request: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send('Request failed: ' + error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes POST (/:user_id/locations) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

// Add experiment conclusion emotions to user
userRouter.post('/:user_id/emotions', async (req: Request, res: Response) => {
  try {
    if (!req.params.user_id) throw new InvalidRequestError('The required parameter "user_id" is missing');
    if (!validateGUID(req.params.user_id)) throw new InvalidRequestError('The parameter "user_id" is not a valid GUID');
    if (!(Array.isArray(req.body.emotions))) throw new InvalidRequestError('The required parameter "emotions" is not an array');
    if (req.body.emotions.length === 0) throw new InvalidRequestError('The parameter "emotions" is empty');

    const user = await userController.get(req.params.user_id);
    if (!user) throw new Error('User not found');

    user.addExperimentConclusionEmotions(req.body.emotions);

    const updateResult = await userController.update(user.getId(), user);
    if (!updateResult) throw new Error('Failed to update user');

    return res.status(200).send();
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `UserRoutes POST (/:user_id/emotions) - Invalid request: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send('Request failed: ' + error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes POST (/:user_id/emotions) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

// Add event to user
userRouter.post('/:user_id/events', async (req: Request, res: Response) => {
  try {
    if (!req.params.user_id) throw new InvalidRequestError('The required parameter "user_id" is missing');
    if (!validateGUID(req.params.user_id)) throw new InvalidRequestError('The parameter "user_id" is not a valid GUID');
    if (!req.body.message) throw new InvalidRequestError('The required parameter "message" is missing');
    if (!req.body.timestamp) throw new InvalidRequestError('The required parameter "timestamp" is missing');
    if (!req.body.roomId) throw new InvalidRequestError('The required parameter "roomId" is missing');
  
    const user = await userController.get(req.params.user_id);
    if (!user) throw new Error('User not found');
  
    const event = eventFactory.create(req.body.message, req.body.timestamp, undefined, [user.getId()], req.body.roomId);
    event.addUserId(req.params.user_id);
    user.addEvent(event.getId());

    const isEventCreated = await eventController.create(event);
    if (!isEventCreated) throw new Error('Failed to save event');

    const updateResult = await userController.update(user.getId(), user);
    if (!updateResult) throw new Error('Failed to update user');
  
    return res.status(201).send({ 
      userId: user.getId(),
      eventId: event.getId()
    });
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `UserRoutes POST (/:user_id/events) - Invalid request: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send('Request failed: ' + error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes POST (/:user_id/events) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

// Update user's video id
userRouter.put('/:user_id/video', async (req: Request, res: Response) => {
  try {
    if (!req.params.user_id) throw new InvalidRequestError('The required parameter "user_id" is missing');
    if (!validateGUID(req.params.user_id)) throw new InvalidRequestError('The parameter "user_id" is not a valid GUID');
    if (!req.body.videoId) throw new InvalidRequestError('The required parameter "videoId" is missing');
  
    const user = await userController.get(req.params.user_id);
    if (!user) throw new Error('User not found');
  
    const video = await videoController.get(req.body.videoId);
    if (!video) throw new InvalidRequestError('The video with the specified id does not exist');
  
    user.addVideo(video.getId());
  
    const isUserUpdated = await userController.update(user.getId(), user);
    if (!isUserUpdated) throw new Error('Failed to update user');
  
    return res.status(200).send({
      userId: user.getId(),
      videoId: video.getId()
    });
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `UserRoutes PUT (/:user_id/video) - Invalid request: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send('Request failed: ' + error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes PUT (/:user_id/video) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});


// Update user destination
userRouter.put('/:user_id/destination', async (req: Request, res: Response) => { 
  try {
    if (!req.params.user_id) throw new InvalidRequestError('The required parameter "user_id" is missing');
    if (!validateGUID(req.params.user_id)) throw new InvalidRequestError('The parameter "user_id" is not a valid GUID');
    if (!req.body.destination) throw new InvalidRequestError('The required parameter "destinationId" is missing');
    if (!(["A", "B", "C", "D"].includes(req.body.destination))) throw new InvalidRequestError("The parameter 'destination' is not valid");
    
    const socketService: SocketService = app.get('socketService');
    socketService.emitToRoom(
      'destination-updated', 
      {
        destination: convertDestinationToLocation(req.body.destination),
      },
      req.params.user_id
    );

    logger.logToBoth(
      `UserRoutes PUT (/:user_id/destination) - Destination updated to ${req.body.destination}`,
      LogLevel.INFO
    );

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `UserRoutes PUT (/:user_id/destination) - Invalid request: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send('Request failed: ' + error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes PUT (/:user_id/destination) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }
  }

  return res.sendStatus(500);
});

// Get by id
userRouter.get('/:user_id', async (req: Request, res: Response) => {
  try {
    if (!req.params.user_id) throw new InvalidRequestError('The required parameter "user_id" is missing');
    if (!validateGUID(req.params.user_id)) throw new InvalidRequestError('The parameter "user_id" is not a valid GUID');
    const user = await userController.get(req.params.user_id);
    return res.status(200).send(user);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `UserRoutes GET (/:user_id) - Invalid request: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send('Request failed: ' + error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes GET (/:user_id) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

// Get collection of locations by user_id
userRouter.get('/:user_id/locations', async (req: Request, res: Response) => {
  try {
    if (!req.params.user_id) throw new InvalidRequestError('The required parameter "user_id" is missing');
    if (!validateGUID(req.params.user_id)) throw new InvalidRequestError('The parameter "user_id" is not a valid GUID');
  
    const user = await userController.get(req.params.user_id);
    const locations = user.getLocationHistory();
  
    return res.status(200).send(locations);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `UserRoutes GET (/:user_id/locations) - Invalid request: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send('Request failed: ' + error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes GET (/:user_id/locations) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

// Get collection of events by user id
userRouter.get('/:user_id/events', async (req: Request, res: Response) => {
  try {
    if (!req.params.user_id) throw new InvalidRequestError('The required parameter "user_id" is missing');
    if (!validateGUID(req.params.user_id)) throw new InvalidRequestError('The parameter "user_id" is not a valid GUID');
  
    const user = await userController.get(req.params.user_id);
    const events = user.getEventHistory();
  
    return res.status(200).send(events);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `UserRoutes GET (/:user_id/events) - Invalid request: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send('Request failed: ' + error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes GET (/:user_id/events) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

// Delete user
userRouter.delete('/:user_id', async (req: Request, res: Response) => {
  try {
    if (!req.params.user_id) throw new InvalidRequestError('The required parameter "user_id" is missing');
    if (!validateGUID(req.params.user_id)) throw new InvalidRequestError('The parameter "user_id" is not a valid GUID');
  
    const isUserDeleted = await userController.delete(req.params.user_id);
    if (!isUserDeleted) throw new Error('Failed to delete user');
  
    return res.status(200).send({
      message: `User with id ${req.params.user_id} deleted`
    });
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `UserRoutes DELETE (/:user_id) - Invalid request: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send('Request failed: ' + error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes DELETE (/:user_id) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

userRouter.post('/disconnect-inactive-users', async (req: Request, res: Response) => { 
  try {
    const INACTIVE_USER_TIMEOUT = 20 * 60 * 1000; // 20 minutes
    const allUsers = await userController.getAll();
    const inactiveUsers = allUsers.filter(user => user.getConnectedTime() < Date.now() - INACTIVE_USER_TIMEOUT);

    for (const user of inactiveUsers) { 
      user.setDisconnectedTime(+(new Date()));
      const userUpdated = await userController.update(user.getId(), user);

      if (!userUpdated) throw new Error('Failed to update user');
    }

    const socketService: SocketService = app.get('socketService');
    socketService.emitToRoom(
      'user-disconnected',
      {

      },
      'admin'
    );

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `UserRoutes POST (/disconnect-inactive-users) - Invalid request: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send('Request failed: ' + error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes POST (/disconnect-inactive-users) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

// Delete all users
userRouter.delete('/', async (req: Request, res: Response) => {
  try {
    const allUsers = await userController.getAll();

    for (const user of allUsers) { 
      const isUserDeleted = await userController.delete(user.getId());
      if (!isUserDeleted) throw new Error('Failed to delete user');
    }
  
    return res.status(200).send({
      message: 'All users deleted'
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.logToBoth(
        `UserRoutes DELETE (/) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

    return res.status(500).send();
  }
});

export default userRouter;
