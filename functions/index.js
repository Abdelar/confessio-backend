const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const {
	getPosts,
	createPost,
	getOnePost,
	getPostsByTag,
	error404,
	generalError,
} = require('./controllers');

const app = express();
app.use(cors());

// GET all posts
app.get('/posts', getPosts);

// create a post
app.post('/post', createPost);

// get one post
app.get('/post/:id', getOnePost);

// get posts by tag
app.get('/posts/:tag', getPostsByTag);

// capture any wild requests
app.use(error404);

// handle general errors
app.use(generalError);

exports.api = functions.region('europe-west1').https.onRequest(app);
