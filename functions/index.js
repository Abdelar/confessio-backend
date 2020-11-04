const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp();

const app = express();

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
	const post = {
		...req.body,
		createdAt: admin.firestore.Timestamp.now(),
	};
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

exports.api = functions.region('europe-west1').https.onRequest(app);
