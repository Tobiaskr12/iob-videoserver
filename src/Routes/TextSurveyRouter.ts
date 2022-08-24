import express, { Request, Response } from "express";
import { container } from "tsyringe";
import Logger from "../Common/Logger.interface";
import { LogLevel } from "../Common/LogLevel.enum";
import validateGUID from "../Common/Util/GUIDValidator";
import InvalidRequestError from "../Errors/InvalidRequestError";
import { TextSurveyFactory } from "../Models/Survey";
import TextSurveyController from '../Controllers/TextSurveyController';

const textSurveyRouter = express.Router();
const logger: Logger = container.resolve('Logger');
const textSurveyController: TextSurveyController = container.resolve('TextSurveyController');
const textSurveyFactory: TextSurveyFactory = container.resolve('TextSurveyFactory');

textSurveyRouter.post('/', async (req: Request, res: Response) => {
   try {
    if (!req.body.userId) throw new Error('The request did not contain a userId key');
    if (!validateGUID(req.body.userId)) throw new Error('The provided userId is not a valid GUID');
    if (!Array.isArray(req.body.answers)) throw new Error('The request did not contain an array of answers');
    if (req.body.answers.length != 7) throw new Error('The request did not contain exactly 7 answers');
    if (!req.body.experimentId) throw new Error('An experiment id was not provided');

    const survey = textSurveyFactory.create(req.body.answers, req.body.userId, req.body.experimentId);
    const isSurveySaved = await textSurveyController.create(survey);

    if (isSurveySaved) {
      return res.status(201).send("Survey created successfully");
    } 

    throw new Error('Failed to create survey');
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


export default textSurveyRouter;