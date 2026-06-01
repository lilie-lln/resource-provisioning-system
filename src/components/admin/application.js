import './admin.css';
import React, { useState, useEffect } from 'react';
import SearchBar from './search';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const fetchApplications = async (searchValue) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/applications`);
    let data = response.data;

    if (!Array.isArray(data)) {
      data = [];
    }

    if (searchValue) {
      data = data.filter((item) =>
        (item.applyname && item.applyname.toLowerCase().includes(searchValue.toLowerCase())) ||
        (item.contact && item.contact.toLowerCase().includes(searchValue.toLowerCase())) ||
        (item.mail && item.mail.toLowerCase().includes(searchValue.toLowerCase())) ||
        (item.status && item.status.toLowerCase().includes(searchValue.toLowerCase())) ||
        (item.results && item.results.toLowerCase().includes(searchValue.toLowerCase()))
      );
    }
    return data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
};

const Application = () => {
  const [data, setData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [activeInBox, setActiveInBox] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState({});
  const [IDinput, setIDinput] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [approvalDate, setApprovalDate] = useState({});

  useEffect(() => {
    fetchApplications(searchValue).then((fetchedData) => {
      setData(fetchedData);
    });
  }, [searchValue]);

  const showInBox = (id) => {
    setActiveInBox(id);
  };

  const hideInBox = () => {
    setActiveInBox(null);
  };

  const handleInputChange = (id, value) => {
    setIDinput((prevInputs) => ({
      ...prevInputs,
      [id]: value,
    }));
  };

  const handleSubmit = async (id) => {
    try {
      const updatedItem = data.find(item => item.id === id);
  
      if (!updatedItem) {
        console.error("Item not found:", id);
        return;
      }
  
      const approvalDate = approvalStatus[id] === 'approved' ? new Date().toISOString() : null;
  
      const courseType = IDinput[`${id}_courseType`];
      if (!courseType) {
        alert('請選擇課程類型！');
        return;
      }
      const updatedData = {
        id: updatedItem.id,
        applyname: updatedItem.applyname,
        contact: updatedItem.contact,
        mail: updatedItem.mail,
        status: approvalStatus[id] === 'approved' ? '已審核' : updatedItem.status,
        results: approvalStatus[id] === 'approved' ? '已通過' : '未通過',
        date: updatedItem.date,
        courseId: IDinput[id] || '',
        courseType: courseType,       // 课程类型
        file_path: updatedItem.file_path 
      };
  
      console.log("Submitting data:", updatedData);
  
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST}:8000/admin/update-application`, updatedData);
      alert('申請成功，資料已更新');
      fetchApplications(searchValue).then((fetchedData) => {
        setData(fetchedData);
      });
      hideInBox();
    } catch (error) {
      alert('Error submitting application:', error);
    }
  };  

  const handleApproval = (id, status) => {
    setApprovalStatus((prevStatus) => ({
      ...prevStatus,
      [id]: status,
    }));
  };

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const DisplayData = data.length > 0 ? data.map((info) => {
    const isReviewed = info.status === '已審核';

    return (
      <tr className='table' key={info.id}>
        <td>{info.applyname}</td>
        <td>{info.contact}</td>
        <td>{info.mail}</td>
        <td>
          <button className='ton' onClick={() => showInBox(info.id)} id="getInBox" disabled={isReviewed}>
            {info.status}
          </button>
          {activeInBox === info.id && (
            <div className="overlay">
              <div className="inBox">
                <div className='cl'></div>
                <div className='content'>
                  <p className='inbox'>詳細資訊</p>
                  <p className='c_p'>課程名稱 </p>
                  <p className='upload'>{info.applyname}</p>
                  <p className='c_p'>下載附件</p>

                  {info.file_path ? (
                    <button
                      className='downloadb'
                      onClick={() => {
                        const fileName = encodeURIComponent(info.file_path.split('/').pop());
                        window.open(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/download/${fileName}`);
                      }}
                    >
                    下載
                    </button>
                  ) : (
                    <p className='upload'>無上傳資料</p>
                  )}
                  <p className='inbox'>Approval</p>
                  <div className='btnapr'>
                    <button
                      className="okay"
                      onClick={() => handleApproval(info.id, 'approved')}
                      disabled={isReviewed}
                    >
                      通過
                    </button>
                    <button
                      className="nookay"
                      onClick={() => handleApproval(info.id, 'rejected')}
                      disabled={isReviewed}
                    >
                      不通過
                    </button>
                  </div>
                  {approvalStatus[info.id] === 'approved' && (
                    <>
                      <input className='setting'
                        type="text" 
                        onChange={(e) => handleInputChange(info.id, e.target.value)} 
                        placeholder="請輸入課程代號" 
                      />
                      <select
                        className="setting"
                        value={IDinput[`${info.id}_courseType`] || ""} // 綁定值
                        onChange={(e) => handleInputChange(`${info.id}_courseType`, e.target.value)}
                        required // 強制必須選擇
                      >
                        <option value="" disabled>
                          請選擇課程類型
                        </option>
                        <option value="學期課程">學期課程</option>
                        <option value="非學期課程">非學期課程</option>
                      </select>
                    </>
                  )}
                  {approvalStatus[info.id] === 'rejected' && (
                    <input 
                      type="text" className='setting'
                      onChange={(e) => handleInputChange(info.id, e.target.value)} 
                      placeholder="說明未通過原因" 
                    />
                  )}
                  <div>
                    {approvalStatus[info.id] && (
                      <>
                        <button className='submitb' onClick={() => handleSubmit(info.id)} id="submitInBox">提交</button>
                        <button className='cancel' onClick={hideInBox} id="delInBox">取消</button>
                      </>
                    )}
                  </div>
                </div>
                <div className='cl'>
                  <button className='closebtn2' onClick={hideInBox} id="closeInBox">X</button>
                </div>
              </div>
              
            </div>
          )}
        </td>
        <td>{info.results}</td>
      </tr>
    );
  }) : (
    <tr>
      <td colSpan="5">No data available</td>
    </tr>
  );
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
    setData(sortedData);
  };
  return (
    <div className='course'>
      <h1>課程申請總表</h1>
      <div className='centered'>
        <h4>
<li>若您決定通過該課程的申請，系統將要求您輸入該課程的帳號以完成設定。</li>

<li>如果申請未通過，請記得及時發送郵件通知申請者，告知他們申請的結果及原因。</li></h4>
        <SearchBar callback={handleSearch} />
        <div className='space'></div>
        <table className="table">
          <thead>
            <tr className='tableh'>
              <th><button className='admbut' onClick={() => sortTable('applyname')}>課程名稱  {sortConfig.key === 'applyname' ? (sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />
              ) : (
                <FontAwesomeIcon icon={faSort} />
                )}</button></th>
              <th><button className='admbut' onClick={() => sortTable('contact')}>負責人 {sortConfig.key === 'contact' ? (sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />
              ) : (
                <FontAwesomeIcon icon={faSort} />
                )}</button></th>
              <th><button className='admbut' onClick={() => sortTable('mail')}>聯絡方式 {sortConfig.key === 'mail' ? (sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />
              ) : (
                <FontAwesomeIcon icon={faSort} />
                )}</button></th>
              <th><button className='admbut' onClick={() => sortTable('status')}>狀態 {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />
              ) : (
                <FontAwesomeIcon icon={faSort} />
                )}</button></th>
              <th><button className='admbut' onClick={() => sortTable('results')}>結果 {sortConfig.key === 'results' ? (sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />
              ) : (
                <FontAwesomeIcon icon={faSort} />
                )}</button></th>
            </tr>
          </thead>
          <tbody>
            {DisplayData}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Application;

