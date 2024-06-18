const Post = require('../models/postModel')
const User = require("../models/userModel")
const Path = require('path')
const fs = require('fs')
const {v4: uuid} = require('uuid')
const HttpError = require("../models/errorModel")
const { error } = require('console')




//==============================CREATE POST
//POST : api/posts
//PROTECTED
const createPost = async (req, res, next) => {
    try {
        let {title, category, description } = req.body;
        if(!title || !category || !description || !req.files) {
            return next(new HttpError("Fill in all fields and choose thumbnail.", 422))
        }
        const { thumbnail } = req.files;
        //check file size
        if(thumbnail.size > 2000000) {
            return next(new HttpError("Thumbnail is too big. File should be less than 2mb."))
        }
            let fileName = thumbnail.name;
            let splittedFilename = fileName.split('.')
            let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
            thumbnail.mv(Path.join(__dirname, '..', '/uploads', newFilename), async (err) => {
                if(err) {
                    return next(new HttpError(err))
                } else {
                    const newPost = await Post.create({title, category, description, thumbnail: newFilename, 
                        creator: req.user.id});
                    if(!newPost) {
                        return next(new HttpError("Post couldn't be created", 422))
                    } 
                    //find user and increse post count by 1
                    const currentUser = await User.findById(req.user.id);
                    const userPostCount = currentUser.posts + 1;
                    await User.findByIdAndUpdate(req.user.id, {posts: userPostCount})

                    res.status(201).json(newPost)
                }
            })
        
    } catch (error) {
        return next(new HttpError(error))
    }
}



//==============================GET ALL THE POSTS
//GET : api/posts
//UNPROTECTED
const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ updatedAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error))
    }
}


//==============================GET SINGLE POST
//GET : api/posts/:id
//UNPROTECTED
const getPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if(!post){
            return next(new HttpError("Post not found.", 404))
        }
        res.status(200).json(post)
    } catch (error) {
        return next(new HttpError(error))
    }
}


//==============================GET BY CATEGORY
//GET : api/posts/categories/:category
//PROTECTED
const getCatPosts = async (req, res, next) => {
   try {
     const {category} = req.params;
     const catPosts = await Post.find({category}).sort({createdAt: -1})
     res.status(200).json(catPosts)
   } catch (error) {
    return next(new HttpError(error))
   }
}


//==============================GET AUTHOR POST
//GET : api/posts/users/:id
//UNPROTECTED
const getUserPosts = async (req, res, next) => {
    try {
        const {id} = req.params;
        const posts = await Post.find({creator: id}).sort({createdAt: -1})
        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }
}



const editPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const { title, category, description } = req.body;

        if (!title || !category || description.length < 12) {
            return next(new HttpError("Fill in all fields.", 422));
        }

        const post = await Post.findById(postId);
        if (!post) {
            return next(new HttpError("Post not found.", 404));
        }

        if (req.user.id !== post.creator.toString()) {
            return next(new HttpError("You are not authorized to edit this post.", 403));
        }

        let updatedPost;

        if (!req.files) {
            // Update without changing the thumbnail
            updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description }, { new: true });
        } else {
            // Update with new thumbnail
            const oldThumbnailPath = Path.join(__dirname, '..', 'uploads', post.thumbnail);
            fs.unlink(oldThumbnailPath, async (err) => {
                if (err) {
                    return next(new HttpError(err.message, 500));
                }
            });

            // Handle new thumbnail
            const { thumbnail } = req.files;
            if (thumbnail.size > 2000000) {
                return next(new HttpError("Thumbnail is too big, should be less than 2mb.", 413));
            }

            const fileName = thumbnail.name;
            const splittedFilename = fileName.split('.');
            const newFileName = `${splittedFilename[0]}${uuid()}.${splittedFilename[splittedFilename.length - 1]}`;
            const newThumbnailPath = Path.join(__dirname, '..', 'uploads', newFileName);

            thumbnail.mv(newThumbnailPath, async (err) => {
                if (err) {
                    return next(new HttpError(err.message, 500));
                }

                // Update post with new thumbnail
                updatedPost = await Post.findByIdAndUpdate(
                    postId,
                    { title, category, description, thumbnail: newFileName },
                    { new: true }
                );

                if (!updatedPost) {
                    return next(new HttpError("Couldn't update post.", 400));
                }

                res.status(200).json(updatedPost);
            });

            return; // Exit function here to wait for async thumbnail.mv
        }

        if (!updatedPost) {
            return next(new HttpError("Couldn't update post.", 400));
        }

        res.status(200).json(updatedPost);
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};



//==============================DELETE POSTS
//DELETE : api/posts/:id
//PROTECTED
const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        if (!postId) {
            return next(new HttpError("Post unavailable.", 400));
        }
        
        const post = await Post.findById(postId);
        const fileName = post?.thumbnail;

        if (req.user.id == post.creator) {
            fs.unlink(Path.join(__dirname, '..', 'uploads', fileName), async (err) => {
                if (err) {
                    return next(new HttpError(err.message));
                } else {
                    await Post.findByIdAndDelete(postId);

                    const currentUser = await User.findById(req.user.id);
                    const userPostCount = currentUser?.posts - 1;
                    await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

                    res.json(`Post ${postId} deleted successfully.`);
                }
            });
        } else {
            return next(new HttpError("Post couldn't be deleted", 403));
        }
    } catch (error) {
        return next(new HttpError(error.message));
    }
};


module.exports = {createPost, getPosts, getPost, getCatPosts, getUserPosts, editPost, 
    deletePost
}