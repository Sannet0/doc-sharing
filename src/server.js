const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const con = require('./consts/base-const');
require('dotenv').config({ path: con.correctOriginPath() + '/.env'});

const authRoutes = require('./routes/auth.route');
const port = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: 'GET, POST'
}));
app.use(express.json({limit: '50mb'}));
app.use('/auth', authRoutes);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST api docs',
    },
  },
  apis: [con.correctOriginPath() + '/src/routes/*.js']
};
const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

http.listen(port, () => {
  console.log(`[server] listening on port :${ port }`);
});
