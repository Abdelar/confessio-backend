exports.validatePost = (req, res) => {
	const { body, tags, author } = req.body;
	if (
		typeof body !== 'string' ||
		(author && typeof author !== 'string') ||
		(tags && !Array.isArray(tags))
	) {
		return res.status(400).json({ error: 'Not the types required' });
	}
	if (!body) {
		return res.status(400).json({
			error: 'This message has no body!',
		});
	}
	if (body.length > 1000) {
		return res.status(400).json({
			error: 'Message too long!',
		});
	}
	if (author && author.length > 100) {
		return res.status(400).json({
			error: 'Author name too long!',
		});
	}
	if (
		tags &&
		(tags.length > 3 ||
			tags.some(tag => typeof tag !== 'string' || tag.length > 15))
	) {
		return res.status(400).json({
			error:
				'Too many tags or some tags are too long!. Please Check also that the tags are of type string',
		});
	}
	return null;
};
