const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

//import routes
const loginUser = require('./routes/user/login');
const signupUser = require('./routes/user/signup');
const getProject = require('./routes/project/get');
const joinProject = require('./routes/project/join');
const createProject = require('./routes/project/create');
const APIstatus = require('./routes/status');

//define express and set port
const app = express();
const port = process.env.PORT || 5000;

//add JSON support
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//add cors to avoid cross-origin error
app.use(cors({origin: '*'}));

//bind routes to url paths
app.use('/api/user/login', loginUser);
app.use('/api/user/signup', signupUser);
app.use('/api/project/join', joinProject);
app.use('/api/project/create', createProject);
app.use('/api/project/get', getProject);
app.use('/api', APIstatus);

app.listen(port, () => console.log(`Listening on port ${port}`));