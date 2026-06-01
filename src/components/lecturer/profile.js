import React, { useState, useEffect } from 'react';
import './lec.css';

function Profile() {
  const [username, setUsername] = useState('');
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState("");
  const [newpassword, setNewPassword] = useState("");
  const [conpassword, setConPassword] = useState("");

  useEffect(() => {
    // Read data from localStorage
    const storedUsername = localStorage.getItem('username') || '';
    setUsername(storedUsername);
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (newpassword !== conpassword) {
      alert('新密碼不相符!');
      return;
    }
    if (password === '' || newpassword === '' || conpassword === '') {
      alert('欄位不得為空!');
      return;
    }

    // Retrieve stored username from localStorage
    const storedUsername = localStorage.getItem('username');
    const updatedData = {
      password: password,
      newpassword: newpassword,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/lecture/password/${storedUsername}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        alert('密碼修改成功!');
        window.location.reload();
      } else {
        response.json().then((data) => {
          alert(data.detail);
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className='lelement'>
      <div className="laccframe">
        <div className="lacctext">
          <div className="laccountsetting">
            <p>密碼設定</p>
          </div>
          <div className="laccinfo">
            <div className='lacct'>
              <p>課程名稱  {username}</p>
            </div>
          </div>
          {/* <table className='lmail'>
            <tbody>
              <tr>
                <td><input type="text" placeholder="user's account" defaultValue={username} readOnly/></td>
              </tr>
            </tbody>
          </table> */}
          {/* <div className="laccinfo">
            <div className='lacct'>
              <p className='laccp'>Mail</p>
            </div>
          </div>
          <table>
            <tbody>
              <tr>
                <td><input type="text" placeholder="Enter verification code." defaultValue={mail} readOnly/></td>
              </tr>
            </tbody>
          </table> */}
          <div className="laccinfo">
            <div className='lacct'>
              <p>密碼</p>
            </div>
          </div>

          {/* Add password change fields here */}
          <form onSubmit={handlePasswordSubmit}>
            <label>
              <p className='laccp'>目前密碼</p>
              <table className='lchangepwd'>
                <tbody>
                  <tr>
                    <td><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='請輸入舊密碼'/></td>
                  </tr>
                </tbody>
              </table>
              <p className='laccp'>新密碼</p>
              <table className='lchangepwd'>
                <tbody>
                <tr>
                  <td><input type="password" value={newpassword} onChange={(e) => setNewPassword(e.target.value)} placeholder='請輸入新密碼' /></td>
                </tr>
                </tbody>
              </table>
              <p className='laccp'>確認新密碼</p>
              <table className='lchangepwd'>
                <tbody>
                  <tr>
                    <td><input type="password" value={conpassword} onChange={(e) => setConPassword(e.target.value)} placeholder='請再次輸入新密碼'/></td>
                  </tr>
                </tbody>
              </table>
            </label>
            <br />
            <button type="submit" className='lsub1'>送出</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
