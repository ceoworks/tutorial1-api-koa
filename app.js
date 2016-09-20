const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const config = require('config');
const handleErrors = require('./middlewares/handleErrors');
const db = require('./db');

const app = new Koa();
const router = new Router();

app.use(handleErrors);
app.use(bodyParser());
router.get('/error/test', async () => {
	throw Error('Error handling works!');
});
router.get('/', (ctx) => ctx.body = {hello: 'world'});

router.post('/birds', async (ctx, next) => {
	const data = ctx.request.body;
	ctx.body = await db.Bird.insertOne(data);
});
router.get('/birds/:id', async (ctx, next) => {
	const id = ctx.params.id;
	ctx.body = await db.Bird.findOneById(id);
});
router.put('/birds/:id', async (ctx, next) => {
	const id = ctx.params.id;
	const data = ctx.request.body;
	ctx.body = await db.Bird.findOneAndUpdate(id, data);
});
router.del('/birds/:id', async (ctx, next) => {
	const id = ctx.params.id;
	ctx.body = await db.Bird.removeOne(id);
});

app.use(router.routes());

db
.connect()
.then(() => {
	app.listen(config.port, () => {
		console.info(`Listening to http://localhost:${config.port}`);
	});
})
.catch((err) => {
	console.error('ERR:', err);
});
