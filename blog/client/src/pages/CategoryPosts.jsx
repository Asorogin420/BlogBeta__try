import React, { useEffect, useState } from 'react';
import PostItem from '../components/PostItem';
import axios from 'axios';
import Loader from '../components/Loader';
import { useParams } from 'react-router-dom';

const CategoryPosts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { category } = useParams();

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/categories/${category}`);
        setPosts(response?.data);
      } catch (err) {
        setError('Failed to fetch posts. Please try again.');
        console.log(err);
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <section className="posts">
      {posts.length > 0 ? (
        <div className="container posts_container">
          {posts.map(({ _id: id, category, title, description, thumbnail, creator, createdAt }) => (
            <PostItem
              key={id}
              postID={id}
              category={category}
              title={title}
              description={description}
              thumbnail={thumbnail}
              authorID={creator}
              createdAt={createdAt}
            />
          ))}
        </div>
      ) : (
        <h2 className="center">No posts found</h2>
      )}
    </section>
  );
};

export default CategoryPosts;
