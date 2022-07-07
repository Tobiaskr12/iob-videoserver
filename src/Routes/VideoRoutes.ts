import express, { Request, Response } from 'express';
import InvalidRequestError from '../Errors/InvalidRequestError';
import validateGUID from '../Common/Util/GUIDValidator';
import SemanticError from '../Errors/SemanticError';
import FormData from 'form-data';
import { LogLevel } from '../Common/LogLevel.enum';
import { Guid } from 'guid-typescript';
import { container } from 'tsyringe';
import Logger from '../Common/Logger.interface';
import IController from '../Controllers/IController.interface';
import Video, { IVideoFactory } from '../Models/Video';

const videoRouter = express.Router();
const videoFactory: IVideoFactory = container.resolve('VideoFactory');
const logger: Logger = container.resolve('Logger');
const videoController: IController<Video, Guid> = container.resolve('VideoController');

/**
 * Upload a video. The request expects a form-data object with the following keys:
 * - videoFile: The .webm or .mov video file
 * - file_extension: The file extension of the video file
 * - recordingStartedTime: The epoch time the video recording started
 * - recordingEndedTime: The epoch time the video recording ended
 * 
 * The request returns a HTTP status code. If the request is successful, the response will contain the video id.
 */
videoRouter.post('/', async (req: Request, res: Response) => {
  try {
    console.log('*****************************' + req.body.file_extension + "             ")
    if (!req.files) throw new InvalidRequestError('The request did not contain a files key');
    if (Array.isArray(req.files.videoFile)) throw new InvalidRequestError('The request contained multiple files');
    if (!(req.body.file_extension === 'webm')) throw new InvalidRequestError('The provided video file format is not supported');
    if (!req.body.recordingStartedTime) throw new InvalidRequestError('The request did not contain a recordingStartedTime key in the body');
    if (!req.body.recordingEndedTime) throw new InvalidRequestError('The request did not contain a recordingEndedTime key in the body');

    const requestVideo = videoFactory.create(req.files.videoFile.data, req.body.file_extension, +req.body.recordingStartedTime, +req.body.recordingEndedTime);
    const isVideoUploaded = await videoController.create(requestVideo);

    if (isVideoUploaded) {
      return res.status(201).send({ id: requestVideo.getId() });
    } 
    
    return res.status(500).send('The video could not be uploaded');
  } catch (error) {
    if (error instanceof InvalidRequestError) { 
      logger.logToBoth(
        `VideoRoutes POST (/) - Invalid request: ${error.message}`,
        LogLevel.INFO,
        error.stack
      );

      return res.status(400).send('Request failed: ' + error.message);
    } else if (error instanceof Error) { 
      logger.logToBoth(
        `VideoRoutes POST (/) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      );
    }
  }
});
  
/**
 * Get all videos. The request returns a FormData object containing the video files' data.
 * 
 * TODO: Should be removed because the request will timeout, when many videos are returned.
 */
videoRouter.get('/all', async (_req: Request, res: Response) => { 
  logger.logToBoth('Requested all videos', LogLevel.INFO);
  try {
    const videos = await videoController.getAll();
    const formData = new FormData();

    for (let i = 0; i < videos.length; i++) { 
      formData.append('videoFiles', videos[i].getDataBuffer());
    }

    res.status(200);
    res.setHeader('Content-Type', 'multipart/form-data; boundary=' + formData.getBoundary());
    return formData.pipe(res);
  } catch (error) {
    if (error instanceof SemanticError) { 
      logger.logToBoth(
        `VideoRoutes GET (/all) - Invalid request: ${error.message}`,
        LogLevel.INFO,
        error.stack
      )

      return res.status(400).send('Request failed: ' + error.message);
    } else if (error instanceof Error) {
      logger.logToBoth(
        `VideoRoutes GET (/all) - Internal server error: ${error.message}`,
        LogLevel.ERROR,
        error.stack
      )
    }

    return res.sendStatus(500);
  }
});

/**
 * Get a video by id. The request expects a query parameter with the key id.
 * The id must be a valid GUID.
 * 
 * The request returns a buffer containing the video file data.
 */
videoRouter.get('/:id', async (req: Request, res: Response) => {
try {
  if (!req.params.id) throw new InvalidRequestError('The request did not contain the query parameter \'id\'');
  if (!(typeof req.params.id === "string")) throw new InvalidRequestError('The query parameter \'id\' must be a string');
  if (!validateGUID(req.params.id)) throw new InvalidRequestError('The query parameter \'id\' is not a valid GUID');

  const video = await videoController.get(Guid.parse(req.params.id));

  return res.status(200).send({
    _id: video.getId(),
    file_extension: video.getFileExtension(),
    recordingStartedTime: video.getRecordingStartedTime(),
    recordingEndedTime: video.getRecordingEndedTime(),
  })
} catch (error) {
  if (error instanceof InvalidRequestError || error instanceof SemanticError) { 
    logger.logToBoth(
      `VideoRoutes GET (/) - Invalid request: ${error.message}`,
      LogLevel.INFO,
      error.stack
    );

    return res.status(400).send('Request failed: ' + error.message);
  } else if (error instanceof Error) { 
    logger.logToBoth(
      `VideoRoutes GET (/) - Internal server error: ${error.message}`,
      LogLevel.ERROR,
      error.stack
    );
  }
  
  return res.sendStatus(500);
}
});

/**
 * Get a video by id. The request expects a query parameter with the key id.
 * The id must be a valid GUID.
 * 
 * The request returns a buffer containing the video file data.
 */
videoRouter.get('/:id/download', async (req: Request, res: Response) => {
try {
  if (!req.params.id) throw new InvalidRequestError('The request did not contain the query parameter \'id\'');
  if (!(typeof req.params.id === "string")) throw new InvalidRequestError('The query parameter \'id\' must be a string');
  if (!validateGUID(req.params.id)) throw new InvalidRequestError('The query parameter \'id\' is not a valid GUID');

  const video = await videoController.get(Guid.parse(req.params.id));
  const formData = new FormData();

  formData.append('videoFile', video.getDataBuffer());

  res.status(200);
  res.setHeader('Content-Type', 'multipart/form-data; boundary=' + formData.getBoundary());
  return formData.pipe(res);
} catch (error) {
  if (error instanceof InvalidRequestError || error instanceof SemanticError) { 
    logger.logToBoth(
      `VideoRoutes GET (/) - Invalid request: ${error.message}`,
      LogLevel.INFO,
      error.stack
    );

    return res.status(400).send('Request failed: ' + error.message);
  } else if (error instanceof Error) { 
    logger.logToBoth(
      `VideoRoutes GET (/) - Internal server error: ${error.message}`,
      LogLevel.ERROR,
      error.stack
    );
  }
  
  return res.sendStatus(500);
}
});


/**
 * Delete a video by id. The request expects a query parameter with the key id.
 * 
 * The request returns a HTTP status code.
 */
videoRouter.delete('/:id', async (req: Request, res: Response) => { 
try {
  if (!(typeof req.query.id === "string")) throw new InvalidRequestError('The query parameter \'id\' must be a string');
  if (!validateGUID(req.query.id)) throw new InvalidRequestError('The query parameter \'id\' is not a valid GUID');

  const isVideoDeleted = await videoController.delete(Guid.parse(req.query.id));

  if (isVideoDeleted) { 
    return res.status(200).send('Video deleted successfully');
  } 

  return res.status(500).send('An unknown error prevented the video from being deleted');
} catch (error) {
  if (error instanceof InvalidRequestError || error instanceof SemanticError) { 
    logger.logToBoth(
      `VideoRoutes DELETE (/) - Invalid request: ${error.message}`,
      LogLevel.INFO,
      error.stack
    );

    return res.status(400).send('Request failed: ' + error.message);
  } else if (error instanceof Error) {
    logger.logToBoth(
      `VideoRoutes DELETE (/) - Internal server error: ${error.message}`,
      LogLevel.ERROR,
      error.stack
    )
  }
  
  return res.sendStatus(500);
}
});

export default videoRouter;
