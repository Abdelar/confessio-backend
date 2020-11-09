const admin = require('firebase-admin');

const { validatePost } = require('./utils/validators');

admin.initializeApp();
const db = admin.firestore();

const perPage = 12;

exports.getPosts = async (req, res, next) => {
	const last = req.query.last;
	try {
		let startAfterSnapshot = db
			.collection('posts')
			.orderBy('createdAt', 'desc');
		if (last) {
			lastDoc = await db.collection('posts').doc(last).get();
			startAfterSnapshot = db
				.collection('posts')
				.orderBy('createdAt', 'desc')
				.startAfter(lastDoc);
		}

		const docs = await startAfterSnapshot.limit(perPage).get();
		const posts = [];
		docs.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
		res.json(posts);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Can't get data",
		});
	}
};

exports.createPost = async (req, res, next) => {
	const errors = validatePost(req, res);
	if (errors) return errors;
	const { body, tags, author } = req.body;
	let post = {
		body,
		createdAt: admin.firestore.Timestamp.now(),
		author: author ? author : 'Anonymous',
	};
	if (tags && tags.length > 0) {
		post = { ...post, tags };
	}
	try {
		const docSnapshot = await db.collection('posts').add(post);
		const doc = await db.collection('posts').doc(docSnapshot.id).get();
		res.json({ id: doc.id, ...doc.data() });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'creating post failed',
		});
	}
};

exports.getOnePost = async (req, res, next) => {
	const postId = req.params.id;
	try {
		const doc = await db.collection('posts').doc(postId).get();
		if (doc.exists) {
			res.json({ id: doc.id, ...doc.data() });
		} else {
			res.status(404).json({
				message: 'No such document!',
			});
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'An error has occurred',
		});
	}
};

exports.getPostsByTag = async (req, res) => {
	const tag = req.params.tag;
	try {
		const snapshot = await db
			.collection('posts')
			.where('tags', 'array-contains', tag)
			.get();
		const posts = [];
		snapshot.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
		res.json(posts);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'an error occurred',
		});
	}
};

exports.error404 = (req, res, next) => {
	res.status(404).json({
		message: 'Bad request',
	});
};

exports.generalError = (err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		message: 'Something broke!',
	});
};
