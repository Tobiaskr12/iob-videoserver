import express, { Request, Response } from "express";
import { container } from "tsyringe";
import { app } from "..";
import Logger from "../Common/Logger.interface";
import { LogLevel } from "../Common/LogLevel.enum";
import InvalidRequestError from "../Errors/InvalidRequestError";
import { SocketService } from "../Services/SocketService";

const adaptionRouter = express.Router();
const logger: Logger = container.resolve('Logger');

adaptionRouter.post('/colorTheme', async (req: Request, res: Response) => {
  try {
    if (!req.body.colorTheme) throw new InvalidRequestError('The request parameter "colorTheme" is required');

    const socketService: SocketService = app.get('socketService');
    socketService.emitToRoom('colorThemeAdaption', req.body.colorTheme, 'all');

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `AdaptionRoutes GET (/colorTheme) - Internal server error: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );
      
      return res.status(400).send(error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `AdaptionRoutes GET (/colorTheme) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

  return res.sendStatus(500);
  }
});

adaptionRouter.post('/fontType', async (req: Request, res: Response) => {
  try {
    if (!req.body.fontType) throw new InvalidRequestError('The request parameter "fontType" is required');

    const socketService: SocketService = app.get('socketService');
    socketService.emitToRoom('fontTypeAdaption', req.body.fontType, 'all');

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `AdaptionRoutes GET (/fontType) - Internal server error: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );
      
      return res.status(400).send(error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `AdaptionRoutes GET (/fontType) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

  return res.sendStatus(500);
  }
});

adaptionRouter.post('/fontSize', async (req: Request, res: Response) => {
  try {
    if (!req.body.fontSize) throw new InvalidRequestError('The request parameter "fontSize" is required');

    const socketService: SocketService = app.get('socketService');
    socketService.emitToRoom('fontSizeAdaption', req.body.fontSize, 'all');

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `AdaptionRoutes GET (/fontSize) - Internal server error: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );
      
      return res.status(400).send(error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `AdaptionRoutes GET (/fontSize) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

  return res.sendStatus(500);
  }
});

adaptionRouter.post('/mapView', async (req: Request, res: Response) => {
  try {
    if (!req.body.mapView) throw new InvalidRequestError('The request parameter "mapView" is required');

    const socketService: SocketService = app.get('socketService');
    socketService.emitToRoom('mapViewAdaption', req.body.mapView, 'all');

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      logger.logToBoth(
        `AdaptionRoutes GET (/mapView) - Internal server error: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );
      
      return res.status(400).send(error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `AdaptionRoutes GET (/mapView) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }

  return res.sendStatus(500);
  }
});

export default adaptionRouter;
