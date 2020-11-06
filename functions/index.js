const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const { validatePost } = require('./utils/validators');

admin.initializeApp();

const app = express();

app.use(cors());

const db = admin.firestore();

// GET all posts
app.get('/posts', (req, res, next) => {
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
				error: 'unable to get posts',
			});
		});
});

// create a post
app.post('/post', (req, res, next) => {
	const errors = validatePost(req, res);
	if (errors) return errors;
	if (tags && tags.length) {
		post = { ...post, tags };
	}
	db.collection('posts')
		.add(post)
		.then(doc => {
			res.json({
				message: `document ${doc.id} created successfully`,
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({
				error: 'creating post failed',
			});
		});
});

app.use((req, res, next) => {
	return res.status(404).json({
		error: 'Bad request',
	});
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

exports.api = functions.region('europe-west1').https.onRequest(app);
