import React, { useState, useEffect } from 'react';
import './teacher.css';
import JsonData from './data/task.json';
import SearchBar from './search';
import { Link } from 'react-router-dom';

// const fetch = (searchValue) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       if (searchValue === "") {
//         resolve(JsonData);
//         return;
//       }
//       const filtered = JsonData.filter((data) =>
//         (data.port && data.port.toLowerCase().includes(searchValue.toLowerCase())));
//       resolve(filtered);
//     });
//   });
// };


function Tclassroom() {
  const [classData, setClassData] = useState([]);

  const handleSearch = (searchValue) => {
    fetch(searchValue).then((filteredData) => {
      setClassData(filteredData);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const username = localStorage.getItem("username");
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/class/${username}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log(data);
        setClassData(Array.isArray(data) ? data : []); // 确保 classData 是数组
      } catch (error) {
        console.error('Error fetching class data:', error);
      }
    };
    fetchData();
  }, []);
  


  return (
    <>
      <div className='filebody'>
        <div className='Tleft'></div>
        <div className='class'>
          <h1>虛擬電腦總覽</h1>
          <h4>
            在創建裝置完成後，在此頁面可以看到裝置的相關狀態。在排程的相對應時間，每台虛擬機會自動開啟。待您將連結傳給學生後，點擊即可打開上課環境。
          </h4>
          <SearchBar callback={handleSearch} />
          <table className='classtable'  >
            <thead>
            <tr>
              {/* <th>Task index</th> */}
              <th>CPU</th>
              <th>記憶體</th>
              <th>GPU</th>
              {/* <th>Number of Devices</th> */}
              <th>映像檔</th>
              <th>排程</th>
              <th>IP 位址</th>
            </tr>
            </thead>
            <tbody>
              {classData && classData.map((data, index) => (
                data.portList && data.portList.map((port, portIndex) => (
                  <tr key={`${index}-${portIndex}`}>
                    {/* <td>{index}</td> */}
                    <td>{data.resource.cpu}</td>
                    <td>{data.resource.mem}</td>
                    <td>{data.resource.gpu}</td>
                    {/* <td>{data.resource.numberOfDevices}</td> */}
                    <td>{data.resource.selectedImage}</td>
                    <td>{data.selectedSlots.join(', ')}</td>
                    <td className='ttlink'><Link to={`http://${data['nodeList'][portIndex]}:${port}`}>{`http://${data['nodeList'][portIndex]}:${port}`}</Link></td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
        <div className='Tright'></div>
      </div>
      <div className='addbutton'>
        <Link to='/tc/devicesetting'><button className="adddevice">+ Add New Class</button></Link>
      </div>
    </>
  );
}

export default Tclassroom;
