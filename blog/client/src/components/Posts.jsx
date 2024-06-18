import React, { useEffect, useState } from 'react'
import axios from 'axios' 

import PostItem from './PostItem'
import Loader from './Loader'



const Posts = () => {
    const [posts, setPosts] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    

        useEffect(() => {
            const fetchPosts = async () => {
                setIsLoading(true);
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`)
                    setPosts(response?.data)
                } catch (err) {
                    console.log(err)
                }

                setIsLoading(false)
            };

            fetchPosts();
        }, [])

        if(isLoading) {
            return <Loader/>
        }

        return (
        <section className="posts">
            {posts.length > 0 ? 
            (<div className="container posts_container">
                {posts.map(({_id: id, category, title, description, thumbnail, creator, createdAt}) => (
                    <PostItem 
                    key={id} postID={id}  category={category} 
                title={title} description={description} thumbnail={thumbnail} authorID={creator} createdAt={createdAt} />
            ))}
            </div>
            ) : ( 
            <h2 className='center'>No posts founds</h2>
        )}
        </section>
    )
}

export default Posts















