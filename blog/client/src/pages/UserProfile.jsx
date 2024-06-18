import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaCheck } from 'react-icons/fa';
import { UserContext } from '../context/userContext';
import axios from 'axios';

const UserProfile = () => {
  const [avatar, setAvatar] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isAvatarTouched, setIsAvatarTouched] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { currentUser, logout } = useContext(UserContext);
  const token = currentUser?.token;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/${currentUser.id}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        });
        const { name, email, avatar } = response.data;
        setName(name);
        setEmail(email);
        setAvatar(avatar);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    getUser();
  }, [currentUser.id, token]);

  const changeAvatarHandler = async () => {
    setIsAvatarTouched(false);
    try {
      const postData = new FormData();
      postData.set('avatar', avatar);
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/users/change-avatar`,
        postData,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      setAvatar(response.data.avatar);
    } catch (error) {
      console.error('Error changing avatar:', error);
    }
  };

  const updateUserDetails = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        name,
        email,
        currentPassword,
        newPassword,
        confirmNewPassword
      };

      const response = await axios.patch(`${process.env.REACT_APP_BASE_URL}/users/edit-user`, userData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }})

      ////////////////////////////////////////////////////////////////////FIX//////////////////
      if (response.status == 200) {
        console.log('Logging out...');
        navigate('/logout');
        }
        } catch (error) {
        setError(error.response?.data?.message || 'Error updating user details');
        console.error('Error updating user details:', error);
        }
        };
     ////////////////////////////////////////////////////////////////////FIX//////////////////





  return (
    <section className="profile">
      <div className="container profile_container">
        <Link to={`/myposts/${currentUser.id}`} className="btn">My posts</Link>
        <div className="profile_details">
          <div className="avatar_wrapper">
            <div className="profile_avatar">
              <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${avatar}`} alt={name} />
            </div>
            <form className="avatar_form">
              <input type="file" name="avatar" id="avatar" onChange={e => setAvatar(e.target.files[0])} accept="image/png, image/jpg, image/jpeg" />
              <label htmlFor="avatar" onClick={() => setIsAvatarTouched(true)}><FaEdit /></label>
            </form>
            {isAvatarTouched && <button className="profile_avatar-btn" onClick={changeAvatarHandler}><FaCheck /></button>}
          </div>
          <h1>{name}</h1>
          <form className="form profile_form" onSubmit={updateUserDetails}>
            {error && <p className="form_error-message">{error}</p>}
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <input type="email" placeholder="Enter Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Enter Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <input type="password" placeholder="Confirm New Password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
            <button type="submit" className="btn primary">Update Info</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
