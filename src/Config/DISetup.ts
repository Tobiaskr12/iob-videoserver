import { container } from "tsyringe";
import { EventFactory } from "../Models/Event";
import { LocationFactory } from "../Models/Location";
import { LogFactory } from "../Models/Log";
import { UserFactory } from "../Models/User";
import { VideoFactory } from "../Models/Video";
import FirebaseStorageVideoManager from './../Wrappers/FirebaseStorageVideoManager';
import MongoLogger from '../Common/Util/MongoLogger';
import MongoDbmanager from "../Wrappers/MongoDBManager";
import VideoController from "../Controllers/VideoController";
import UserController from "../Controllers/UserController";
import LogController from "../Controllers/LogController";
import LocationController from "../Controllers/LocationController";
import EventController from "../Controllers/EventController";
import TelemetryController from './../Controllers/TelemetryController'
import { TelemetryFactory } from '../Models/Telemetry'
import TextSurveyController from '../Controllers/TextSurveyController';
import { TextSurveyFactory } from "../Models/TextSurvey";
import { ScaleSurveyFactory } from "../Models/ScaleSurvey";
import ScaleSurveyController from "../Controllers/ScaleSurveyController";

export const setupDI = () => {
  // Register util and wrappers
  container.register("VideoHostManager", {
    useClass: FirebaseStorageVideoManager
  });
  container.register("Logger", {
    useClass: MongoLogger
  });
  container.register("DatabaseManager", {
    useClass: MongoDbmanager
  });

  // Register Controllers
  container.register("VideoController", {
    useClass: VideoController
  });
  container.register("EventController", {
    useClass: EventController
  });
  container.register("LocationController", {
    useClass: LocationController
  });
  container.register("LogController", {
    useClass: LogController
  });
  container.register("UserController", {
    useClass: UserController
  });
  container.register("TextSurveyController", {
    useClass: TextSurveyController
  });
  container.register("ScaleSurveyController", {
    useClass: ScaleSurveyController
  });
  container.register("TelemetryController", {
    useClass: TelemetryController
  })

  // Register Factories
  container.register("VideoFactory", {
    useClass: VideoFactory
  });
  container.register("EventFactory", {
    useClass: EventFactory
  });
  container.register("LocationFactory", {
    useClass: LocationFactory
  });
  container.register("LogFactory", { 
    useClass: LogFactory
  });
  container.register("UserFactory", { 
    useClass: UserFactory
  });
  container.register("TextSurveyFactory", {
    useClass: TextSurveyFactory
  });
  container.register("ScaleSurveyFactory", {
    useClass: ScaleSurveyFactory
  });
  container.register("TelemetryFactory", {
    useClass: TelemetryFactory
  })
  

}
