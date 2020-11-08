const admin = require('firebase-admin');

const { validatePost } = require('./utils/validators');

admin.initializeApp();
const db = admin.firestore();

const perPage = 3;

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
			message: error.message,
		});
	}
};

exports.createPost = (req, res, next) => {
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
	db.collection('posts')
		.add(post)
		.then(doc => {
			return db.collection('posts').doc(doc.id).get();
		})
		.then(doc => {
			res.json({
				id: doc.id,
				...doc.data(),
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({
				message: 'creating post failed',
			});
		});
};

exports.getOnePost = (req, res, next) => {
	const postId = req.params.id;
	db.collection('posts')
		.doc(postId)
		.get()
		.then(doc => {
			if (doc.exists) {
				res.json({ id: doc.id, ...doc.data() });
			} else {
				res.status(404).json({
					message: 'No such document!',
				});
			}
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({
				message: 'An error has occurred',
			});
		});
};

exports.getPostsByTag = (req, res) => {
	const tag = req.params.tag;
	db.collection('posts')
		.where('tags', 'array-contains', tag)
		.get()
		.then(querySnapshot => {
			const posts = [];
			querySnapshot.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
			res.json(posts);
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({
				message: 'an error occurred',
			});
		});
};

exports.error404 = (req, res, next) => {
	return res.status(404).json({
		message: 'Bad request',
	});
};

exports.generalError = (err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		message: 'Something broke!',
	});
};

// const docRef = db.collection('posts').doc(req.query.last);
// const snapshot = await docRef.get();
// const startAtSnapshot = db
// 	.collection('posts')
// 	.orderBy('createdAt', 'desc')
// 	.startAt(snapshot);

// const docs = await startAtSnapshot.limit(perPage).get();
// const posts = docs.map();
