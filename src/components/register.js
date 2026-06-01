import React, { useState } from 'react';
import axios from 'axios';
import './register.css';
import { Link } from "react-router-dom";

const Register = () => {
  const [applyname, setApplyname] = useState('');
  const [contact, setcontact] = useState('');
  const [mail, setmail] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('applyname', applyname);
    formData.append('contact', contact);
    formData.append('mail', mail);
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/application`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    
      setMessage(response.data.message);
      setApplyname('');
      setcontact('');
      setmail('');
      setFile(null);
      alert('申請成功');
      window.history.back();
    } catch (error) {
      if (error.response) {
        console.error('Error:', error.response.data);
        setMessage(error.response.data.detail || 'An error occurred');
      } else {
        console.error('Error:', error.message);
        setMessage('An error occurred');
      }
    }    
  };

  return (
    <div className="element-login">
      <div className='loginccl'>
          CCL
      </div>
      <div className="frame">
        <Link to="/Login" className="close"></Link>
        <div className="text">
          <div className="signin">
            <p>遞送課程申請</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="paragraph">
              <p>課程名稱</p>
            </div>
            <input
              type="text"
              id="applyname"
              value={applyname}
              onChange={(e) => setApplyname(e.target.value)}
              required
            />
            <div className="paragraph">
              <p>申請人</p>
            </div>
            <input
              type="text"
              id="contact"
              value={contact}
              onChange={(e) => setcontact(e.target.value)}
              required
            />
            <div className="paragraph">
              <p>電子郵件</p>
            </div>
            <input
              type="email"
              id="mail"
              value={mail}
              onChange={(e) => setmail(e.target.value)}
              required
            />
            <div className="paragraph">
              <p>證明文件（非必填）</p>
            </div>
            <div className='fileupload'>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            <button type="submit">提交</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
