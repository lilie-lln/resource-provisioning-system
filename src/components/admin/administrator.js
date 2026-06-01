import './admin.css';
import React, { useState, useEffect } from 'react';
import SearchBar from './search';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const fetchAdministrators = async (searchValue) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_HOST}:8000/admin/`);
    let data = response.data;

    if (searchValue) {
      data = data.filter((item) =>
        (item.username && item.username.toLowerCase().includes(searchValue.toLowerCase())) ||
        (item.mail && item.mail.toLowerCase().includes(searchValue.toLowerCase())) ||
        (item.date && item.date.toLowerCase().includes(searchValue.toLowerCase()))
      );
    }
    return data;
  } catch (error) {
    console.error('Error fetching administrators:', error);
    return []; // 返回空数组，避免返回 undefined
  }
};

const deleteAdministrator = async (username) => {
  try {
    await axios.delete(`${process.env.REACT_APP_BACKEND_HOST}:8000/admin/administrators/${username}`);
    alert('刪除成功');
  } catch (error) {
    console.error('Error deleting administrator:', error);
    alert('刪除失敗，請檢查用戶名是否存在。');
  }
};

const Overlay = ({ onClose, onSubmit, setLoading }) => {
  const [username, setUsername] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);  // 设置按钮状态为“操作中...”
    
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_HOST}:8000/admin`, {
        username,
        mail,
        password,
        date: new Date().toISOString(),
        permission: 1,
      });
      onSubmit();
      alert('建立成功');
      onClose();
      
    } catch (error) {
      console.error('Error submitting administrator data:', error);
    } finally {
      setLoading(false); 
    }
  };
  
  return (
    <div className="overlay">
      <div className="overlay-content">
        <button type="button" className='closebtn3' onClick={onClose}>X</button>
        <h1>新增新管理員</h1>
        <form onSubmit={handleSubmit}>
          <label>
            帳號名稱
            <br /><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label><br />
          <label>
            信箱
            <br /><input type="text" value={mail} onChange={(e) => setMail(e.target.value)} />
          </label><br />
          <label>
            密碼
            <br /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label><br />
          <button type="submit" className='asub'>送出</button>
          <button type="button" className='acancel' onClick={onClose}>取消</button>
        </form>
      </div>
    </div>
  );
};

const Administrator = () => {
  const [data, setArticles] = useState([]); // 初始化为空数组
  const [searchValue, setSearchValue] = useState("");
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [userPermission, setUserPermission] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [loading, setLoading] = useState(false); 
  const [currentUsername, setCurrentUsername] = useState("");

  const handleOverlayOpen = () => {
    setIsOverlayVisible(true);
  };

  const handleOverlayClose = () => {
    setIsOverlayVisible(false);
  };

  const fetchData = async () => {
    setLoading(true);  
    const data = await fetchAdministrators(searchValue);
    setArticles(data);
    setLoading(false);  
  };

  useEffect(() => {
    const permission = localStorage.getItem('userPermission');
    const username = localStorage.getItem('username');
    setUserPermission(Number(permission));
    setCurrentUsername(username);
    fetchData();
  }, [searchValue]);

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleOverlaySubmit = async () => {
    setLoading(true);  // 在提交时，显示“操作中...”
    await fetchData();
    setLoading(false); 
  };

  const handleDelete = async (username) => {
    const confirmed = window.confirm(`是否確定刪除管理者 ${username}?`);
    if (confirmed) {
      setLoading(true); 
      await deleteAdministrator(username);
      fetchData();
      setLoading(false);  // 操作完成
    }
  };

  // 确保 data 不为空
  const DisplayData = data && data.map((info) => {
    const format = new Date(info.date).toLocaleDateString();
    return (
      <tr className='table' key={info.username}>
        <td>{info.username}</td>
        <td>{info.mail}</td>
        <td>{format}</td>
        <td>
          <button className='tons' onClick={() => handleDelete(info.username)} disabled={loading || info.username === currentUsername}>刪除</button>
        </td>
      </tr>
    );
  });

  const sortTable = (key) => {
    let sortedData = [...data];
    let direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';

    sortedData.sort((a, b) => {
      let x = a[key];
      let y = b[key];

      if (typeof x === 'string') {
        x = x.toLowerCase();
        y = y.toLowerCase();
      }

      return direction === 'asc' ? (x > y ? 1 : -1) : (x < y ? 1 : -1);
    });

    setSortConfig({ key, direction });
    setArticles(sortedData);
  };

  return (
    <div className='course'>
      <h1>管理員列表</h1>

      <div className='centered'>
      <h4>在此頁面中，您可以新增或刪除其他管理員的帳號。<br/>請注意：請勿隨意刪除其他管理員的帳號，請在刪除前確認該管理員的身分和必要性。</h4>
        {loading && <div className="loading-indicator">操作進行中，請稍候...</div>}
        <table className='ali'>
          <tbody>
            <tr>
              <td>
                <SearchBar callback={handleSearch} />
              </td>
              <td>
              <button className='AddingButton' onClick={handleOverlayOpen} disabled={loading}>
                {loading ? '操作中...' : '新增'}
              </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div className='space'></div>
        <table className="table">
          <thead>
            <tr className='tableh'>
              <th><button className='admbut' onClick={() => sortTable('username')} disabled={loading}>管理員帳號  {sortConfig.key === 'username' ? (
                sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />
                ) : (
                  <FontAwesomeIcon icon={faSort} />
                )}</button></th>
              <th><button className='admbut' onClick={() => sortTable('mail')} disabled={loading}>聯絡方式  {sortConfig.key === 'mail' ? (
                sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />
                ) : (
                  <FontAwesomeIcon icon={faSort} />
                )}</button></th>
              <th><button className='admbut' onClick={() => sortTable('date')} disabled={loading}>建立日期  {sortConfig.key === 'date' ? (
                sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />
                ) : (
                  <FontAwesomeIcon icon={faSort} />
                )}</button></th>
              <th>編輯</th>
            </tr>
          </thead>
          <tbody>
            {DisplayData}
          </tbody>
        </table>
      </div>
      {isOverlayVisible && <Overlay onClose={handleOverlayClose} onSubmit={handleOverlaySubmit} setLoading={setLoading} />}
    </div>
  );
};

export default Administrator;
