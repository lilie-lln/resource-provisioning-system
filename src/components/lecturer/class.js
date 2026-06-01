import React, { useState, useEffect } from 'react';
import './lec.css';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function Class() {
  const [classData, setClassData] = useState('');
  const [Overlay, setOverlay] = useState(false);
  const username = localStorage.getItem("username");
  
  const handleCommentSave = (portIndex, index) => (event) => {
    const comment = document.getElementById(`${index}-${portIndex}`).value;
    // request to save comment
    console.log(portIndex, index, comment);
    fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/class/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        portIndex: portIndex,
        index: index,
        comment: comment,
      }),
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: '儲存成功',
          showConfirmButton: false,
          timer: 3000
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);

      }
    });
  };    

  const handleCommentChange = (e, index, portIndex) => {
    const updatedClassData = [...classData];
    if (!updatedClassData[index].comment) {
      updatedClassData[index].comment = [];
    }
    updatedClassData[index].comment[portIndex] = e.target.value;
    setClassData(updatedClassData); // Assuming setClassData is your state setter for classData
  };
  const handleStart = (portIndex, index, startALL) => (event) => {
    // request to start the VM
    console.log(portIndex, index);
    Swal.fire({
      title: '開啟所有機器中...',
      text: '請稍候',
      allowOutsideClick: false,   // Prevent users from closing the alert by clicking outside
      didOpen: () => {
        Swal.showLoading();       // Show loading spinner
      },
    });
    fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/class/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        deviceID: portIndex,
        taskID: index,
        startALL: startALL,
      }),
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: '啟動成功',
          showConfirmButton: false,
          timer: 3000
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  };

  const handleDown = (portIndex, index, poweroffALL) => (event) => {
    // request to shutdown the VM
    console.log(portIndex, index);
    Swal.fire({
      title: '關閉所有機器中...',
      text: '請稍候',
      allowOutsideClick: false,   // Prevent users from closing the alert by clicking outside
      didOpen: () => {
        Swal.showLoading();       // Show loading spinner
      },
    });
    fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/class/poweroff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        deviceID: portIndex,
        taskID: index,
        poweroffALL: poweroffALL,
      }),
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: '關機成功',
          showConfirmButton: false,
          timer: 3000
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  };

  const handleCommit = (portIndex, index, commitALL) => (event) => {
    // request to commit the VM
    console.log(portIndex, index);
    Swal.fire({
      title: 'Processing...',
      text: 'Please wait while your request is being processed',
      allowOutsideClick: false,   // Prevent users from closing the alert by clicking outside
      didOpen: () => {
        Swal.showLoading();       // Show loading spinner
      },
    });
    fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/class/commit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        deviceID: portIndex,
        taskID: index,
        commitALL: commitALL,
      }),
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.success) {
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: '打包成功',
            showConfirmButton: false,
            timer: 3000
          });
        }, 3000);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  };


  // const handleSearch = (searchValue) => {
  //   const lowerCaseSearchValue = searchValue.toLowerCase();
  //   const filteredData = classData.filter((data) => {
  //     return data.portList && data.portList.some((port, portIndex) => {
  //       const ipAddress = `${data.nodeList[portIndex]}:${port}`;
  //       return (
  //         ipAddress.toLowerCase().includes(lowerCaseSearchValue) ||
  //         (data.remarks && data.remarks.toLowerCase().includes(lowerCaseSearchValue)) ||
  //         (data.createdAt && data.createdAt.toLowerCase().includes(lowerCaseSearchValue))
  //       );
  //     });
  //   });
  //   setClassData(filteredData);
  // };
  // const SearchBar = ({ callback }) => {
  //   const [input, setInnerValue] = useState("");
  
  //   const handleSubmit = (e) => {
  //     e.preventDefault();
  //     callback(input);
  //     setInnerValue(""); // Clear input after submission
  //   };
  
  //   return (
  //     <form className="lsearchBar" onSubmit={handleSubmit}>
  //       <input
  //         type="text"
  //         value={input}
  //         onChange={(e) => setInnerValue(e.target.value)}
  //       />
  //       <button type="submit" className="lsearchButton"><p>搜尋</p></button>
  //       <button className="lsearchButton" onClick={display}>配置詳細資訊</button>
  //     </form>
      
  //   );
  // };
  const sum = () => {
    return classData.reduce((total, data) => total + (data.resource.numberOfDevices || 0), 0);
  };
  const close = () => {
    setOverlay(false);
  }
  useEffect(() => {
    const username = localStorage.getItem("username");
    fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/class/${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      setClassData(data);
    })
  }, []);
  
  const timeSlots_z = {
    midnight: '午夜',
    morning: '上午',
    noon: '下午',
    night: '晚上',
  };

  const days_z = {
    Monday: '星期一',
    Tuesday: '星期二',
    Wednesday: '星期三',
    Thursday: '星期四',
    Friday: '星期五',
    Saturday: '星期六',
    Sunday: '星期日',
  };
  const overlay_time = (selectedSlots) => {
    return selectedSlots.map((slot) => {
      const [day, timeSlot] = slot.split('-');
      const translatedDay = days_z[day] || day;
      const translatedTime = timeSlots_z[timeSlot] || timeSlot;
      return `${translatedDay}-${translatedTime}`;
    });
  };

  if (classData.length === 0) {
    return <p>尚未設定虛擬電腦!請至<strong>建立虛擬電腦教室</strong>中進行設定</p>; // Return a message or an empty table if data is unavailable
  }
  return (
    <>
      <div className='lfilebody'>
        <div className='lleft'></div>
        <div className='lclass'>
          <h1>虛擬電腦總覽</h1>
          <h3>
            在創建裝置完成後，在此頁面可以看到裝置的相關狀態。在排程的相對應時間，每台虛擬機會自動開啟。待您將連結傳給學生後，點擊即可打開上課環境。
          </h3>
          {/* <button className="nbtn" onClick={display}>配置詳細資訊</button> */}
          <h4>詳細資訊</h4>
          <table className='lclasstable'>
            <thead>
              <tr>
                <th>總裝置數</th>
                <th>CPU</th>
                <th>GPU</th>
                <th>記憶體</th>
                <th>映像檔</th>
                <th>選擇的時段</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{sum()}</td>
                <td>{ classData[0] && classData[0].resource.cpu}</td>
                <td>{ classData[0] && classData[0].resource.gpu}</td>
                <td>{ classData[0] && classData[0].resource.mem}</td>
                <td>{ classData[0] && classData[0].resource.selectedImage}</td>
                <td>{ classData[0] && overlay_time(classData[0].selectedSlots).join(', ')}</td>
              </tr>
            </tbody>
          </table>
          {/* <SearchBar callback={handleSearch}/>           */}
          <h4>電腦總覽</h4>
          <table className='lclasstable'>
            <thead>
              <tr>
                <th>IP 位址</th>
                <th>備註</th>
                <th>建立時間</th>
                <th>狀態</th>
                <th>動作
                <div className='thbtn-container'>
                    <button className='thbtn' onClick={handleStart(null, null, true)}>啟動</button>
                    <button className='thbtn' onClick={handleDown(null, null, true)}>關機</button>
                    <button className='thbtn' onClick={handleCommit(null, null, true)}>打包</button>
                    { /* <button className='thbtn'>下載</button> */ }
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {classData && classData.map((data, index) => (
                data.portList && data.portList.map((port, portIndex) => (
                  <tr key={`${index}-${portIndex}`}>
                    {/* <td>{index +1}-{portIndex + 1}</td> */}
                    
                    <td>
                      {data['status'][portIndex] === 'running' || data['status'][portIndex] === 'running_by_user' ? (
                      <Link to={`http://${data['nodeList'][portIndex]}:${port}`} className='lllll'>{`${data['nodeList'][portIndex]}:${port}`}</Link>
                      ) : (
                      <span>{`${data['nodeList'][portIndex]}:${port}`}</span>
                      )}
                      </td>

                    <td>
                    <div className='nbtn-container'>
                      {data.comment ? (
                      <input 
                            id={`${index}-${portIndex}`} 
                            type='text' 
                            value={data.comment[portIndex]}
                            onChange={(e) => handleCommentChange(e, index, portIndex)} // Add this line to handle changes
                      />
                      ) : (
                      <input 
                            id={`${index}-${portIndex}`} 
                            type='text' 
                            onChange={(e) => handleCommentChange(e, index, portIndex)} // Add this line to handle changes
                      />
                      )}
                      <button className='nbtn' onClick={handleCommentSave(portIndex, index)}>儲存</button>
                      </div>
                      </td>
                    <td>
                      { data['createTime'] ? data['createTime'] : '未知' }
                    </td>
                    <td>  {
                      data['status'][portIndex] === 'running' ? '運行中' : data['status'][portIndex] === 'stopped' ? '已停止' : data['status'][portIndex] === 'stopped_by_user' ? '手動停止' : data['status'][portIndex] === 'committing' ? '打包中' : data['status'][portIndex] === 'downloading' ? '下載中' : data['status'][portIndex] === "running_by_user" ? '手動運行' : '未知'
                    }
                    </td>
                    <td>
                      <div className='nbtn-container'>
                        <button className='nbtn' onClick={handleStart(portIndex, index, false)}>啟動</button>
                        <button className='nbtn' onClick={handleDown(portIndex, index, false)}>關機</button>
                        <button className='nbtn' onClick={handleCommit(portIndex, index, false)}>打包</button>
                        { data['download_status'][portIndex] === 'success' ? (
                          // userclass folder
                            <a href={`${process.env.REACT_APP_BACKEND_HOST}/downloads/class/${username}/${username}-${index+1}-${portIndex+1}.tar`}>
                              <button className='nbtn'>下載</button>
                            </a>
                          ) :  data['download_status'][portIndex] === 'commiting' ? (<button className='nbtn' disabled>打包中</button>) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
          
        {Overlay && classData[0] && (
            <div className="overlay">
              <div className="overlay-content">
                <h2>詳細資訊</h2>
               
                 <p>總裝置數: {sum()}</p>

                <p>CPU: { classData[0] && classData[0].resource.cpu}</p>
                <p>GPU: { classData[0] && classData[0].resource.gpu}</p>
                <p>記憶體: { classData[0] && classData[0].resource.mem}</p>
                <p>映像檔: { classData[0] && classData[0].resource.selectedImage}</p>
                <p>選擇的時段: {overlay_time(classData[0].selectedSlots).join(', ')}</p>

                <button className='nbtn'onClick={close}>關閉</button>
              </div>
            </div>
          )}
        </div>
      <div className='lright'></div>
    </div>
    </>
  );
}

export default Class;
