const express = require('express');
const app = express();
const db = require('./config/db');
const port = 3000;

const userRouter = require('./Api/Users');

app.use(express.json());

// Route requests to '/user' to the userRouter
app.use('/user', userRouter);

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`)
})