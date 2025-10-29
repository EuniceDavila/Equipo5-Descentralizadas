const express = require('express');
const app = express();
const bodyParser = require('body-parser');

//const userRoutes = require('./routes/user');
const examentRoutes = require('./routes/Examen');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//app.use('/api/user', userRoutes);
app.use('/api/examen', examentRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server at port ${PORT}`));