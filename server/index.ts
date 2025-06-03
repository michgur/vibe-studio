import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import contactsRouter from './contacts';
import recordingRouter from './recording';
import reportsRouter from './reports';

const app = express();
const port = 5432;

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/api", contactsRouter);
app.use("/api", recordingRouter);
app.use("/api", reportsRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
