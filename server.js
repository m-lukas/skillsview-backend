import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

import loginUser from './routes/user/login';
import signupUser from './routes/user/signup';
import getProject from './routes/project/get';
import joinProject from './routes/project/join';
import createProject from './routes/project/create';

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/api/user/login', loginUser);
app.use('/api/user/signup', signupUser);
app.use('/api/project/join', joinProject);
app.use('/api/project/create', createProject);
app.use('/api/project/get', getProject);

app.listen(port, () => console.log(`Listening on port ${port}`));