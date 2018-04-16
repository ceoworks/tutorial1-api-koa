# Node.js Heaven with Koa 2, Gulp, Babel, MongoDB and async/await

# UPDATE - YOU NO LONGER NEED GULP AND BABEL TO USE async/await, SIMPLY USE NODE v8 and above

Hello there, I hope you are interested in modern approach of building API’s with Node.js, cause it’s would be the main theme of this tutorial.

Let’s make quick overview, what’s hidden in this article:

    - setting up Koa 2 server
    - creating basic API folder structure
    - transpiling async/await to generator functions
    - implementing basic Model with Data Abstraction Layer in Mind
    - wiring up basic API CRUD


It's the first tutorial in the series of "Node.js Heaven" - [full tutorial on bugless.me](http://bugless.me/nodejs-heaven-with-koa2-gulp-babel-mongodb-and-async-await/)

<h3>NPM and dependencies</h3>
<p style="text-align: left;">First thing everyone should do when building some API - describe your dependencies in <em>package.json</em> file.
So, let's create yet another (or first, if you're a novice) <em>package.json</em> file with following cli command:
<span class="theme:terminal font-size:14 line-height:18 lang:default highlight:0 decode:true crayon-inline">npm init --yes</span></p>
<p style="text-align: left;"> -<em>-yes</em> flag helps you answer yes to all the npm questions. After this step, you'll have basic <em>package.json.</em></p>
Now we could install all the dependencies and save them to <em>package.json:
<span class="theme:terminal font-size:14 line-height:18 lang:yaml highlight:0 decode:true crayon-inline">npm i koa@2 koa-router@next koa-bodyparser@next gulp gulp-babel babel-plugin-syntax-async-functions config --save</span> </em>

So, let's look closely:
<ul>
 	<li><em><span class="theme:terminal font-size:14 line-height:18 lang:default highlight:0 decode:true crayon-inline">koa@2</span> - </em>next generation of well known Koa framework, supports async/await functions</li>
 	<li><em><span class="theme:terminal font-size:14 line-height:18 lang:default highlight:0 decode:true crayon-inline">koa-router@next</span></em> - routing with support for Koa 2 and async/await</li>
 	<li><em><span class="theme:terminal font-size:14 line-height:18 lang:default highlight:0 decode:true crayon-inline">koa-bodyparser@next</span></em> - parses JSON in requests for us</li>
 	<li><em><span class="theme:terminal font-size:14 line-height:18 lang:default highlight:0 decode:true crayon-inline">gulp</span></em> - efficient easy-to-use build system, you'll love it</li>
 	<li><em><span class="theme:terminal font-size:14 line-height:18 lang:default highlight:0 decode:true crayon-inline">gulp-babel</span></em> - we'd like to set transpiling with babel</li>
 	<li><em><span class="theme:terminal font-size:14 line-height:18 lang:default highlight:0 decode:true crayon-inline">babel-plugin-syntax-async-functions</span></em> - transpiles async/await functions to generators</li>
 	<li><em><span class="theme:terminal font-size:14 line-height:18 lang:default highlight:0 decode:true crayon-inline">config</span></em> - there is no API without config, trust me!</li>
</ul>
<h3 style="text-align: left;">Wiring up Koa server with routes</h3>
So, let's dive deep into our app.js (please update <em>entry</em> at your <em>package.json)</em>, which would look like this:
<pre class="font-size:14 line-height:18 lang:js decode:true ">const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const config = require('config');

const app = new Koa();
const router = new Router();

app.use(bodyParser());
router.get('/', (ctx) =&gt; ctx.body = {hello: 'world'});
app.use(router.routes());

app.listen(config.port, () =&gt; {
	console.info(`Listening to http://localhost:${config.port}`);
});
</pre>
Also, you'll need to create <em>config/default.js </em>at the root of your project with simple export:
<pre class="lang:js decode:true ">module.exports = {
	port: 1234
};
</pre>
Great news, we could run <span class="theme:terminal lang:js highlight:0 decode:true crayon-inline ">node app.js</span>  to launch server and get our beautiful <span class="font-size:14 line-height:18 lang:js decode:true crayon-inline">{hello: 'world'}</span> response!
<h3 style="text-align: left;">Async/await transpiling and why we actually need it</h3>
<p style="text-align: left;">Considering significant fact Node.js is hard because of it's asynchronous nature, that's where async/await approach comes to the rescue! It tames complexity of callbacks and manipulates promises just as good old synchronous code!</p>
<p style="text-align: left;">Next thing we want is error handling middleware, but before implementing it, we must understand that latest Node.js version (6.5.0) still doesn't support async/await functions natively. It's definitely the place where <strong>Babel</strong> comes in hand!</p>
<p style="text-align: left;">Let's set it up! First, install required Babel plugin:</p>
<p style="text-align: left;"><span class="lang:default highlight:0 decode:true crayon-inline">npm install babel-plugin-transform-async-to-generator --save</span></p>
This plugin would manage all the hard things for us, and to successfully use it we should create <strong>gulpfile.js</strong> with next default task:
<pre class="lang:js decode:true ">const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', () =&gt; {
	return gulp.src(['app.js', 'src/**/*.js'])
		.pipe(babel({
			plugins: ['transform-async-to-generator']
		}))
		.pipe(gulp.dest('dist'));
});
</pre>
Yep, that's how we do it! Last small step of our preparations - add <em>line 2</em> to <strong>package.json</strong>:
<pre class="lang:js decode:true ">  "scripts": {
    "start": "gulp &amp;&amp; node dist/app.js",
    "test": "echo \"Error: no test specified\" &amp;&amp; exit 1"
  }</pre>
And now, when every <strong>async function</strong> could be transpiled, let's create <em>src</em> folder, where we put in all the source code and add to <em>src/middlewares/handleErrors.js </em>next few lines of code:
<pre class="lang:js decode:true">module.exports = async (ctx, next) =&gt; {
	try {
		await next();
	} catch (e) {
		const resError = {
			code: 500,
			message: e.message,
			errors: e.errors
		};
		if (e instanceof Error) {
			Object.assign(resError, {stack: e.stack});
		}
		Object.assign(ctx, {body: resError, status: e.status || 500});
	}
};</pre>
So, here is our first <strong>async function</strong>, which will help us catch every error and send it to our reponse instead of silently writing to console.
The last step, in <em>app.js </em>let's write one more endpoint, and it surely would be async:
<pre class="lang:js decode:true ">router.get('/error/test', async () =&gt; {
	throw Error('Error handling works!');
});</pre>
So now, when we run <em>npm start </em>and type in browser <em>http://localhost:1234/error/test </em>we would get error with detailed stack trace! Victory!
<h3 style="text-align: left;">All the juice of MongoDB with async/await</h3>
<p style="text-align: left;">Okay, our next challenge is simplifying work with DB. There is well known solution called <strong>Data abstraction/access layer</strong>, but its implementation may depend on a lot of different factors. In our case it would be enough to write very simple DAL, but it will show us all the benefits.</p>
So, here is our <strong>roadmap</strong>:
<ol>
 	<li>Install mongod npm module</li>
 	<li>Setting up connection to DB on startup</li>
 	<li>Creating <strong>simple model with CRUD</strong> (create, read, update and delete) methods</li>
 	<li>Pass db instance, received in the first step, to model we created</li>
 	<li>Actually, use it :)</li>
</ol>
<p style="text-align: left;">Before we go further, please install and run MongoDB, as it would be our toy today (<a href="https://docs.mongodb.com/manual/installation/" target="_blank">https://docs.mongodb.com/manual/installation/</a>)</p>
<p style="text-align: left;"><strong>1.</strong>  <span class="theme:terminal lang:js highlight:0 decode:true crayon-inline">npm i mongodb --save</span>  - now you have that awesome mongodb driver</p>
<strong>2.</strong>  setting up basic connection is quick and easy, let's create folder <strong>db</strong> in root of the project and place there index.js file with next simple code:
<pre class="lang:js decode:true ">const mongodb = require('mongodb');
const config = require('config');

module.exports = {
	connect: async () =&gt; {
		await MongoClient.connect(config.db.url);
	}
};
</pre>
The main point here is that <em>connect </em>method of <em>MongoClient </em>could be used both ways as a <em>callback</em> and as a <em>promise</em>. As you see, we prefer the second way and combine it with <em>async/await</em> control flow methodic. That's simple! Don't forget to update your <em>config/default.js</em> to look like this:
<pre class="lang:js decode:true ">module.exports = {
	port: 1234,
	db: {
		url: 'mongodb://localhost:27017/koatutor'
	}
};
</pre>
Our<i> </i>finishing touches would change <em>app.js </em>a little (<strong>lines 6, 19-28</strong>):
<pre class="lang:js mark:6,19-28 decode:true">const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const config = require('config');
const handleErrors = require('./middlewares/handleErrors');
const db = require('./db');

const app = new Koa();
const router = new Router();

app.use(handleErrors);
app.use(bodyParser());
router.get('/error/test', async () =&gt; {
	throw Error('Error handling works!');
});
router.get('/', (ctx) =&gt; ctx.body = {hello: 'world'});
app.use(router.routes());

db
.connect()
.then(() =&gt; {
	app.listen(config.port, () =&gt; {
		console.info(`Listening to http://localhost:${config.port}`);
	});
})
.catch((err) =&gt; {
	console.error('ERR:', err);
});
</pre>
As we could see here, <em>async function</em> also could be used with <em>promise</em> interface, that's fantastic!

<strong>2.</strong> It's time for first model. Let's imagine, that we need to organize all birds all over the world and store them into our DB. That's where <strong>Bird</strong> model comes to the rescue!

A little changes touched <em>src/db/index.js</em>, and now our <em>connect</em> method and <em>export</em>:
<pre class="lang:js decode:true">const MongoClient = require('mongodb').MongoClient;
const config = require('config');
const Model = require('./model');
let db;

class Db {
	async connect() {
		if (!db) {
			db = await MongoClient.connect(config.db.url);
			this.Bird = new Model(db, 'birds');
		}
	}
};

module.exports = new Db();</pre>
Using of <em>class </em>is absolutely necessary here, cause it allows us to map our models into db instance. That's the moment, when we implement our <strong>4.</strong> - pass <em>db </em>as the first argument to the <em>Model</em>.
And Model for now looks very simple (<em>src/db/model.js</em>):
<pre class="lang:js decode:true">class Model {
	constructor(db, collectionName) {
		this.name = collectionName;
		this.db = db;
	}
}

module.exports = Model;
</pre>
That's how we do it!

&nbsp;

So what's next? Let's start with <em>create</em> operation:
<pre class="lang:js decode:true ">class Model {
	constructor(db, collectionName) {
		this.name = collectionName;
		this.db = db;
	}
	async insertOne(data) {
		const operation = await this.db.collection(this.name).insertOne(data);
		if (operation.result.ok !== 1 || operation.ops.length !== 1) {
			throw new Error('Db insertOne error');
		}
		return operation.ops[0];
	}
}

module.exports = Model;</pre>
The reason why we named create operation as <em>insertOne </em>is just consistency with MongoDB api.

Also, we check for insert correctness by checking <em>result.ok </em>and <em>ops.length </em>properties. In return statement we just take the one and only inserted document and show it to the world.

&nbsp;

Final touch, add some route in <em>app.js</em> to let some request arrive:
<pre class="lang:js decode:true ">...
router.get('/', (ctx) =&gt; ctx.body = {hello: 'world'});
router.post('/birds', async (ctx, next) =&gt; {
	const data = ctx.request.body;
	ctx.body = await db.Bird.insertOne(data);
});
app.use(router.routes());

db
.connect()
...</pre>
And now, we could use our API in the right way:

<span class="lang:sh decode:true crayon-inline">curl -H "Content-Type: application/json" -X POST -d '{"bird":"seagull","age":"3"}' http://localhost:1234/birds</span>

It would be nice to get stored bird, so <em>get</em> operation of Model CRUD would be next:
<pre class="lang:js decode:true">const ObjectId = require('mongodb').ObjectID;

class Model {
	constructor(db, collectionName) {
		this.name = collectionName;
		this.db = db;
	}
	async insertOne(data) {
		const operation = await this.db.collection(this.name).insertOne(data);
		if (operation.result.ok !== 1 || operation.ops.length !== 1) {
			throw new Error('Db insertOne error');
		}
		return operation.ops[0];
	}
	async findOneById(id) {
		let query = {
			_id: ObjectId(id)
		}
		const result = await this.db.collection(this.name).findOne(query);
		if (!result) {
			throw new Error('Db findOneById error');
		}
		return result;
	}
}

module.exports = Model;</pre>
What's new, what's old? Now we have <em>ObjectId</em> wrapper, which would help us with getting documents from db. If we pass <em>id</em> received in request raw as string, MongoDB would return us nothing. Notice, that <em>findOne </em>returns straightly document, so we just check, that it was found and pass document back to route.

Don't forget to add the route in <em>app.js</em>:
<pre class="lang:js decode:true">...
router.get('/', (ctx) =&gt; ctx.body = {hello: 'world'});

router.post('/birds', async (ctx, next) =&gt; {
	const data = ctx.request.body;
	ctx.body = await db.Bird.insertOne(data);
});
router.get('/birds/:id', async (ctx, next) =&gt; {
	const id = ctx.params.id;
	ctx.body = await db.Bird.findOneById(id);
});

app.use(router.routes());
...</pre>
Here we see old good params - <em>id </em>from route could be accessed in <em>ctx.params</em>, and that's great.
So, <em>npm start</em> the API and send request(! change <em>57def7f270e422085ca61d28 </em>to id from your DB !):
<span class="lang:sh decode:true crayon-inline">curl -X GET http://localhost:1234/birds/57def7f270e422085ca61d28</span>

Now we could happily access every stored document!

There are only two operations left - <strong>U</strong>pdate and <strong>D</strong>elete. Here is the self-described code:
<pre class="lang:js decode:true">const ObjectId = require('mongodb').ObjectID;

class Model {
	constructor(db, collectionName) {
		this.name = collectionName;
		this.db = db;
	}
...
	async findOneAndUpdate(id, data) {
		const query = {_id: ObjectId(id)};
		const modifier = {$set: data};
		const options = {returnOriginal: false};
		const operation = await this.db
			.collection(this.name)
			.findOneAndUpdate(query, modifier, options);

		if (!operation.value) {
			throw new Error('Db findOneAndUpdate error');
		}
		return operation.value;
	}
	async removeOne(id) {
		const query = {_id: ObjectId(id)};
		const operation = await this.db.collection(this.name).remove(query);
		if (operation.result.n !== 1) {
			throw new Error('Db remove error');
		}
		return {success: true};
	}
}

module.exports = Model;</pre>
Take a look at <em>$set </em>operator, which allows us partially update document in db by touching only properties specified in <em>data</em>. Options object contains <em>returnOriginal</em> property, which is set to false cause we need updated document as the result at the end of operation, yep?)
Error handling takes its way by checking for <em>value </em>in <em>findOneAndUpdate </em>and for <em>result.n </em>in removeOne operation.

The last but not the least - bring our new functionality to routes in <em>app.js</em>:
<pre class="lang:js decode:true">...
router.get('/birds/:id', async (ctx, next) =&gt; {
	const id = ctx.params.id;
	ctx.body = await db.Bird.findOneById(id);
});
router.put('/birds/:id', async (ctx, next) =&gt; {
	const id = ctx.params.id;
	const data = ctx.request.body;
	ctx.body = await db.Bird.findOneAndUpdate(id, data);
});
router.del('/birds/:id', async (ctx, next) =&gt; {
	const id = ctx.params.id;
	ctx.body = await db.Bird.removeOne(id);
});

app.use(router.routes());
...</pre>
Now we can update our document with next request:

<span class="lang:sh decode:true crayon-inline ">curl -H "Content-Type: application/json" -X PUT -d '{"appearance":"white","age":"5"}' http://localhost:1234/birds/57def7f270e422085ca61d28</span>

Such update will <em>$set</em>(rewrite)<em> </em>property <em>age </em>to 5 and add one new - <em>appearance</em> and <em>$set </em>it to "white".

Be careful while updating documents, cause <strong>doing it without $set will overwrite the whole document </strong>and it could lead to loss of data.

Okay, let's remove the gull:
<span class="lang:sh decode:true crayon-inline ">curl -H "Content-Type: application/json" -X DELETE http://localhost:1234/birds/57def7f270e422085ca61d28</span>

Oh yep, it works perfectly!
So it seems to be done easily, though.

Little remarks for the future:
<ul>
 	<li>there also <strong>should be Service layer </strong>in the middle of routes and DAL, it was dismissed in this tutorial for the sake of simplicity</li>
 	<li>there also <strong>should be findAll method(implemented with streams)</strong> in DAL, and we'll talk about it in the next article ;)</li>
 	<li>there also <strong>should be some even simple tests</strong>. Mocha allows painless testing, next article will show you</li>
 	<li>there also <strong>should be basic eslint checks</strong>, search for it</li>
</ul>
All assumptions, corrects, remarks and all the words you could find must be written to the comments below!

Thanks for your attention and patience, hope you enjoyed our journey!
