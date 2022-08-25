import 'reflect-metadata';
import 'dotenv/config';

// Setup Dependency Injection Container (Must be done as early as possible)
import { setupDI } from './Config/DISetup';
setupDI();

import http from 'http';
import { MongoClient } from 'mongodb';
import { getDbConnectionString } from './Config/DBSetup';
import videoRouter from './Routes/VideoRoutes';
import { app } from './index';
import { container } from 'tsyringe';
import logRouter from './Routes/LogRoutes';
import userRouter from './Routes/UserRoutes';
import eventRouter from './Routes/EventRoutes';
import locationRouter from './Routes/LocationRoutes';
import { SocketService } from './Services/SocketService';
import adaptionRouter from './Routes/AdaptionRoutes';
import telemetryRouter from './Routes/TelemetryRouter'
import textSurveyRouter from './Routes/TextSurveyRouter';
import scaleSurveyRouter from './Routes/ScaleSurveyRouter';

const server = http.createServer(app);
const port = process.env.PORT;

app.set('videoFactory', container.resolve('VideoFactory'));
app.set('logger', container.resolve('Logger'));
app.set('videoController', container.resolve('VideoController'));

app.use('/videos', videoRouter);
app.use('/logs', logRouter);
app.use('/users', userRouter);
app.use('/events', eventRouter);
app.use('/locations', locationRouter);
app.use('/adaptions', adaptionRouter);
app.use('/telemetry', telemetryRouter);
app.use('/text-survey', textSurveyRouter);
app.use('/scale-survey', scaleSurveyRouter);


MongoClient.connect(getDbConnectionString(), async (err, client) => {
    if (err || !client) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        server.listen(port, async () => {
            const db = client.db(process.env.MONGO_ATLAS_DB_NAME);
            app.set('database', db);
            app.set('Logger', container.resolve('Logger'));
            app.set('socketService', new SocketService(server, container.resolve('Logger')));
        });
    }
});
