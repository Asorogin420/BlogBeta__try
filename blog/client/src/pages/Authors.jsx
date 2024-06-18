import React, { useEffect } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

import Loader from '../components/Loader'





const Authors = () => {
  const [authors, setAuthor] = useState([])
  const [isLoading, setIsLoading] = useState(false)


  useEffect(() => {
    const getAuthors = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users`)
        setAuthor(response.data)
      } catch (error) {
        console.log(error)
      }
      setIsLoading(false)
    }

    getAuthors();
  }, [])

  if(isLoading) {
    return <Loader/>
  }


  return (
    <div>
      <section className="authors">
        { authors.length > 0 ? <div className="container authors_container">
          {
            authors.map(({_id: id, avatar, name, posts}) => {
              return <Link key={id} to={`/posts/users/${id}`} className= "author">
                <div className="authors_avatar">
                <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${avatar}`} alt={`Profile picture of ${name}`} />
                </div>
                <div className="authors_info">
                  <h4>{name}</h4>
                  <p>{posts}</p>
                </div>
              </Link>
            })
          }
        </div> : <h2 className='center'>NO users/authors found.</h2>}
      </section>
    </div>
  )
}

export default Authors

