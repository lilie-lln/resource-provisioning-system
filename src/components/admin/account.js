import React, { useState, useEffect } from 'react';
import './admin.css';

function Account() {
  const [username, setUsername] = useState('');
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState("");
  const [newpassword, setNewPassword] = useState("");
  const [conpassword, setConPassword] = useState("");

  useEffect(() => {
    // Read data from localStorage
    const storedUsername = localStorage.getItem('username') || '';
    const storedMail = localStorage.getItem('userMail') || '';
    setUsername(storedUsername);
    setMail(storedMail);
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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/admin/password/${storedUsername}`, {
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
    <div className='accelement'>
      <div className="accframe">
        <div className="acctext">
          <div className="accountsetting">
            <p>密碼設定</p>
          </div>
          <div className="accinfo">
            <div className='acct'>
              <p>使用者名稱: {username}</p>
            </div>
          </div>
          {/* <table className='mail'>
            <tbody>
              <tr>
                <td><input type="text" value={username} readOnly /></td>
              </tr>
            </tbody>
          </table> */}

          {/* <div className="accinfo">
            <div className='acct'>
              <p>電子信箱</p>
            </div>
          </div> */}
          {/* <table>
            <tbody>
              <tr>
                <td><input type="text" value={mail} readOnly /></td>
              </tr>
            </tbody>
          </table> */}

          <div className="accinfo">
            <div className='acct'>
              <p>密碼</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <label>
              <p className='accp'>目前密碼</p>
              <table className='changepwd'>
                <tbody>
                  <tr>
                    <td><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='請輸入舊密碼'/></td>
                  </tr>
                </tbody>
              </table>
              <p className='accp'>新密碼</p>
              <table className='changepwd'>
                <tbody>
                <tr>
                  <td><input type="password" value={newpassword} onChange={(e) => setNewPassword(e.target.value)} placeholder='請輸入新密碼' /></td>
                </tr>
                </tbody>
              </table>
              <p className='accp'>確認新密碼</p>
              <table className='changepwd'>
                <tbody>
                  <tr>
                    <td><input type="password" value={conpassword} onChange={(e) => setConPassword(e.target.value)} placeholder='請再次輸入新密碼'/></td>
                  </tr>
                </tbody>
              </table>
            </label>
            <br />
            <button type="submit" className='sub1'>送出</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Account;
