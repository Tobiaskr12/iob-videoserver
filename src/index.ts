import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import firebaseAdmin from 'firebase-admin';
import bodyParser from 'body-parser';

export const app = express()

const firebaseConfig = JSON.parse(process.env.FIREBASE_CREDENTIALS as string);

firebaseAdmin.initializeApp({// @ts-ignore
  credential: firebaseAdmin.credential.cert(firebaseConfig),
  storageBucket: 'gs://emergency-experiment.appspot.com'
});

app.use(fileUpload());
app.use(bodyParser.json());
app.use(cors(
  {
    origin: '*',
  }
));

