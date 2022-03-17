const express = require('express');
const app = express();
const cors = require('cors');
const formidableMiddleware = require('express-formidable');
const http = require('http').createServer(app);
const con = require('./consts/base-const');
require('dotenv').config({ path: con.correctOriginPath() + '/.env'});
const swaggerUi = require('swagger-ui-express');
const prodSwaggerDocument = require('./swagger/swagger-prod.json');
const devSwaggerDocument = require('./swagger/swagger-dev.json');
const authRoutes = require('./routes/auth.route');
const folderRoutes = require('./routes/folders.route');
const fileRoutes = require('./routes/files.route')
const jwtMiddleware = require('./middelwares/jwt.middelwares');

const port = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: 'GET, POST, PATCH, DELETE'
}));
app.use(express.json({ limit: '50mb' }));
//app.use(formidableMiddleware());

app.use('/auth', authRoutes);
app.use('/folders', jwtMiddleware, folderRoutes);
app.use('/file',  jwtMiddleware, formidableMiddleware(), fileRoutes);
app.use('/docs', swaggerUi.serve);

if (process.env.IS_PRODUCTION === '1') {
  app.get('/docs', swaggerUi.setup(prodSwaggerDocument));
} else if (process.env.IS_PRODUCTION === '0') {
  app.get('/docs', swaggerUi.setup(devSwaggerDocument));
}

app.use('/', (req, res) => {
  return res.send('Hello this is doc-sharing api!')
});

http.listen(port, () => {
  console.log(`[server] listening on port :${ port }`);
});
