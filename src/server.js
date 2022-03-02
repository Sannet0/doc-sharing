const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config({ path: __dirname + '/.env'});

const authRoutes = require('./routes/auth.route');
const port = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: 'GET, POST'
}));
app.use(express.json());
app.use('/auth', authRoutes);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST api docs',
    },
  },
  apis: ['./src/routes/*.js'],
};
const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

http.listen(port, () => {
  console.log(`[server] listening on port :${ port }`);
});
