import React, { useState, useEffect } from 'react';
import './teacher.css';

function Taccount() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newpassword, setNewPassword] = useState('');
  const [conpassword, setConPassword] = useState('');

  // 使用 useEffect 從 localStorage 加載用戶名
  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || 'user123'; // Default if not found
    setUsername(storedUsername);
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newpassword !== conpassword) {
      alert('新密碼不匹配');
      return;
    }
    if (password === '' || newpassword === '' || conpassword === '') {
      alert('所有密碼字段都需要填寫');
      return;
    }

    // 從 localStorage 獲取用戶名，並進行密碼更新
    const storedUsername = localStorage.getItem('username');
    const updatedData = {
      password: password,
      newpassword: newpassword,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/teacher/password/${storedUsername}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert('密碼更新成功');
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.detail || '密碼更新失敗');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className='telement'>
      <div className="taccframe">
        <div className="tacctext">
          <div className="taccountsetting">
            <p>密碼設定</p>
          </div>
          <div className="taccinfo">
            <div className='tacct'>
              <p>課程名稱 {username}</p>
            </div>
          </div>
          {/* <table className='tmail'>
            <tbody>
              <tr>
                <td><input type="text" placeholder="user's account" defaultValue={username} readOnly /></td>
              </tr>
            </tbody>
          </table> */}

          <div className="taccinfo">
            <div className='tacct'>
              <p>密碼</p>
            </div>
          </div>

          {/* 密碼修改區域 */}
          <form onSubmit={handlePasswordSubmit}>
            <label>
              <p className='taccp'>目前密碼</p>
              <table className='tchangepwd'>
                <tbody>
                  <tr>
                    <td><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='請輸入舊密碼' /></td>
                  </tr>
                </tbody>
              </table>
              <p className='taccp'>新密碼</p>
              <table className='tchangepwd'>
                <tbody>
                  <tr>
                    <td><input type="password" value={newpassword} onChange={(e) => setNewPassword(e.target.value)} placeholder='請輸入新密碼' /></td>
                  </tr>
                </tbody>
              </table>  
              <p className='taccp'>確認新密碼</p>
              <table className='tchangepwd'>
                <tbody>
                  <tr>
                    <td><input type="password" value={conpassword} onChange={(e) => setConPassword(e.target.value)} placeholder='請再次輸入新密碼' /></td>
                  </tr>
                </tbody>
              </table>
            </label>
            <button type="submit" className='tsub1'>送出</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Taccount;
