import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import firebaseAdmin from 'firebase-admin';
import bodyParser from 'body-parser';

export const app = express()


firebaseAdmin.initializeApp({// @ts-ignore
  credential: firebaseAdmin.credential.applicationDefault(),
  storageBucket: 'gs://siob-test.appspot.com/'
});

app.use(fileUpload());
app.use(bodyParser.json());
app.use(cors(
  {
    origin: '*',
  }
));

