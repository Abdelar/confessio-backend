const admin = require('firebase-admin');

const { validatePost } = require('./utils/validators');

admin.initializeApp();
const db = admin.firestore();

exports.getPosts = (req, res, next) => {
	db.collection('posts')
		.orderBy('createdAt', 'desc')
		.get()
		.then(querySnapshot => {
			const posts = [];
			querySnapshot.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
			res.json(posts);
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({
				message: 'unable to get posts',
			});
		});
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
			console.log({ id: doc.id, ...doc.data() });
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
