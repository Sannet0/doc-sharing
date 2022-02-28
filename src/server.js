const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
require('dotenv').config();

const userRoutes = require('./routes/user.route');

app.use(cors({
  origin: '*',
  methods: 'GET, POST'
}));
app.use(express.json());

app.use('/user', userRoutes);

http.listen(process.env.PORT, () => {
  console.log(`[server] listening on port :${ process.env.PORT }`);
});
