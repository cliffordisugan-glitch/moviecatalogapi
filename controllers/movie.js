const Movie = require('../models/Movie');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Robust helper function to extract Cloudinary public_id from a URL
 */
const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    let path = parts[1].split('?')[0];

    // Remove transformation string if present
    const pathSegments = path.split('/');
    if (pathSegments[0].includes('_') || pathSegments[0].includes(',')) {
      pathSegments.shift();
      path = pathSegments.join('/');
    }

    // Remove version tag (e.g. v1625000000/)
    path = path.replace(/^v\d+\//, '');

    // Strip extension (.jpg, .png, etc.)
    const lastDotIndex = path.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      path = path.substring(0, lastDotIndex);
    }

    return path;
  } catch (err) {
    console.error('Error parsing public_id:', err);
    return null;
  }
};

// Add Movie (Admin Only)
module.exports.addMovie = async (req, res) => {
    try {
        let newMovie = new Movie({
            title: req.body.title,
            director: req.body.director,
            year: req.body.year,
            description: req.body.description,
            genre: req.body.genre,
            image: req.body.image || '',
            comments: []
        });

        const savedMovie = await newMovie.save();
        return res.status(201).send(savedMovie);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// Get All Movies
module.exports.getMovies = async (req, res) => {
    try {
        const movies = await Movie.find({});
        return res.status(200).send({ movies });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// Get Specific Movie
module.exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).send({ message: 'Movie not found' });
        return res.status(200).send(movie);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// Update Movie (Admin Only)
module.exports.updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).send({ message: 'Movie not found' });

        const newImageUrl = req.body.image;
        const oldImageUrl = movie.image;

        // Check if a new image was passed and it differs from existing image
        if (newImageUrl && newImageUrl !== oldImageUrl) {
            if (oldImageUrl) {
                const publicId = getPublicIdFromUrl(oldImageUrl);
                console.log('--- DELETING OLD CLOUDINARY IMAGE ---');
                console.log('Old Image URL:', oldImageUrl);
                console.log('Public ID:', publicId);

                if (publicId) {
                    try {
                        const result = await cloudinary.uploader.destroy(publicId);
                        console.log('Cloudinary Destroy Result:', result);
                    } catch (cloudError) {
                        console.error('Failed to delete old image from Cloudinary:', cloudError.message);
                    }
                }
            }
        }

        // Apply incoming field updates
        Object.assign(movie, req.body);
        const updatedMovie = await movie.save();

        return res.status(200).send({ message: 'Movie updated successfully', updatedMovie });
    } catch (error) {
        console.error('Update Movie Error:', error);
        return res.status(500).send({ error: error.message });
    }
};

// Delete Movie (Admin Only)
module.exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).send({ message: 'Movie not found' });

        if (movie.image) {
            const publicId = getPublicIdFromUrl(movie.image);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudError) {
                    console.error('Cloudinary destroy error during movie deletion:', cloudError.message);
                }
            }
        }

        await Movie.findByIdAndDelete(req.params.id);
        return res.status(200).send({ message: 'Movie deleted successfully' });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// Add Comment
module.exports.addComment = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).send({ message: 'Movie not found' });

        movie.comments.push({
            userId: req.user.id,
            comment: req.body.comment
        });

        await movie.save();
        return res.status(200).send({ message: 'Comment added successfully', updatedMovie: movie });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// Get Movie Comments
module.exports.getComments = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).send({ message: 'Movie not found' });
        return res.status(200).send({ comments: movie.comments });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};