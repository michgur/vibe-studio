import express from 'express';
import cors from 'cors';
import contactsRouter from './contacts';
import recordingRouter from './recording';

const app = express();
const port = 5432;

app.use(cors());
app.use("/api", contactsRouter);
app.use("/api", recordingRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
