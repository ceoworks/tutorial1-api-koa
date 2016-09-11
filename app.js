const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const config = require('config');
const handleErrors = require('./middlewares/handleErrors');

const app = new Koa();
const router = new Router();

app.use(handleErrors);
app.use(bodyParser());
router.get('/error/test', async () => {
	throw Error('Error handling works!');
});
router.get('/', (ctx) => ctx.body = {hello: 'world'});
app.use(router.routes());

app.listen(config.port, () => {
	console.info(`Listening to http://localhost:${config.port}`);
});
