import React, { useContext, useEffect, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useNavigate, useParams } from 'react-router-dom'
import {UserContext} from '../context/userContext'
import axios from 'axios'

const EditePost = () => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Uncategorized')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [error, setError] = useState('')


  const navigate = useNavigate();
  const {id} = useParams();

  const {currentUser} = useContext(UserContext)
  const token = currentUser?.token;

  //redirect to login pajefor any unregistered user
  useEffect(() => {
    if(!token){
      navigate('/login')
    }
  }, [])


  const modules = {
    toolbar: [
      [{'heade' : [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list' : 'ordered'}, {'list' : 'bullet'}, {'indent' : '-1'}, {'indent' : '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  }

  const formats = [
    'header', 'bold', 'italic',
    'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ]

  const POST_CATEGORIES = [
    "Digital Marketing Strategies in Pharma", "Patient Education and Engagement",
  "Healthcare Professional (HCP) Outreach", "Market Access and Reimbursement",
  "Brand Management and Positioning", "Regulatory Compliance in Pharma Marketing",
  "Pharma Analytics and Market Research", "Collaborations and Partnerships",
  "ontent Marketing and Storytelling","Crisis Communication and Reputation Management", "weather"
  ]


  useEffect(() => {
    const getPost = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/post/${id}`)
        setTitle(response.data.title)
        setDescription(response.data.description)
      } catch (error) {
        console.log(error)
      }
    }
    getPost();
  }, [])


  const editPost = async (e) => {
    e.preventDefault();

    const postData = new FormData();
    postData.set('title', title)
    postData.set('category', category)
    postData.set('description', description)
    postData.set('thumbnail', thumbnail)

    try {
      const response = await axios.patch(`${process.env.REACT_APP_BASE_URL}/posts/${id}`, postData, {withCredentials:
        true, headers: {Authorization: `Bearer ${token}`}})
        if(response.status == 200) {
          return navigate('/')
        }
    } catch (err) {
      setError(err.response.data.message)
    }

  }


  return (
   <section className="edit-post">
    <div className="container">
      <h2>Edit Post</h2>
      {error && <p className="form_error-message">{error}</p>}
      <form className="form create-post_form" onSubmit={editPost}>
        <input type="text" placeholder='Title' value={title} onChange={e => setTitle(e.target.value)}
        autoFocus/>
        <select name="category" value={category} onChange={e => setCategory(e.target.value)}>
          {
            POST_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)
          }
        </select>
        <ReactQuill modules={modules} formats={formats} value={description} onChange={setDescription}/>
          <input type="file" onChange={e => setThumbnail(e.target.files[0])} 
          accept='png, jpg, jpeg'/>
          <button type="submit" className='btn primary'>Update</button>
      </form>
    </div>
   </section>
  )
}

export default EditePost
