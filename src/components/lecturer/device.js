import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './lec.css';


function Device() {
  // const [username, setUsername] = useState('');
  const [isTableVisible, setTableVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('沒有選擇映像檔');
  const [numberOfDevices, setNumberOfDevices] = useState('');
  const [image, setImage] = useState([]);
  const [gpu, setGpu] = useState(0);
  const [cpu, setCpu] = useState(0);
  const [mem, setMem] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [timeSlots,setTimeSlots] = useState([]);
  const [curDevices, setCurDevices] = useState('');


  const navigate = useNavigate(); // Initialize the navigate function

  const toggleTable = () => {
    setTableVisible(!isTableVisible);
  };

  const handleSelectImage = (imageName) => {
    setSelectedImage(imageName);
    setTableVisible(false); 
  };
  const username = localStorage.getItem('username');
  // get image name from the table
  useEffect(() => {
    // Fetch device.json
    fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/class/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const totalDevices = data.reduce((total, item) => {
            return total + (item.resource.numberOfDevices || 0); 
          }, 0);
          setCurDevices(totalDevices); 
          const resource = data[0].resource;
          setGpu(resource.gpu);
          setCpu(resource.cpu);
          setMem(resource.mem);
          setNumberOfDevices(resource.numberOfDevices);
          setSelectedImage(resource.selectedImage);
          setIsDisabled(true);
          const selectedSlots = data[0].selectedSlots || [];
          setTimeSlots(selectedSlots);
        }
      })
      .catch(error => console.error('Error fetching device data:', error));
  }, []);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/image/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      // setImage to response
      .then((response) => response.json())
      .then((response) => {
        // set image list to image from response
        response.map((item) => {
          setImage((image) => [...image, item]);
        }
        )
        console.log(image);
      })

  } , []);
  
  const UploadFile = () => {
    // Navigate to the schedule page with device settings as state
    navigate('/lec/file', {
      state: {
        gpu: Number(gpu),
        cpu: Number(cpu),
        mem: Number(mem),
        // selectedImage: selectedImage,
        numberOfDevices: Number(numberOfDevices)
      }
    });
  };
  const handleNextStep = () => {
    // Navigate to the schedule page with device settings as state
    navigate('/lec/lschedule', {
      state: {
        gpu: Number(gpu),
        cpu: Number(cpu),
        mem: Number(mem),
        selectedImage: selectedImage,
        numberOfDevices: Number(numberOfDevices),
        // isdisable:{isDisabled}
        timeSlots:timeSlots
      }
    });
  };

  return (
    <>
      <div className='lcenter'>
        <div className='llflex'>
          <div className='ldescribedevice'>
                <h3>* 步驟說明 *</h3>
                <p>1. <b>輸入所需裝置數量：</b>在「所需裝置數量」欄位中，請輸入您所需的裝置數量。此數量將決定您將要創建的裝置數。</p>
                <p>2. <b>選擇映像檔案：</b>在「本課裝置所需映像檔案」部分，點擊「選擇映像檔」按鈕，表格中為您剛剛添加或其他老師放置公共區的映像檔案，選擇適合此課程所需的檔案後，系統會顯示已選取的檔案名稱。</p>                              
                <p>3. <b>配置硬體資源：</b>接著，在「GPU數量」、「CPU數量」以及「記憶體 (GB)」的欄位中，分別輸入您所需的資源。這些資源將用於配置裝置的硬體性能。</p>
                <p>4. <b>下一步：</b>最後，確認所有配置正確無誤後，點擊「下一步」按鈕，進行下一步排程。</p>
                <h4><strong>請注意，待建立完成後，將以週為單位，重複至該學期結束。</strong></h4>
          </div>
        </div>
        <div className='ldevice'>
          <div className='ldevice1'>
            <h1>設定虛擬電腦規格</h1>
            <fieldset>
              <legend><h3>指定虛擬機器數量</h3></legend>
              <h4>目前已有{curDevices}台，此次欲增加數量為:</h4>
              <div className="ldevnum-container">
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={numberOfDevices}
                    onChange={(e) => setNumberOfDevices(e.target.value)}
                    className="progress"
                />
                {/* <label htmlFor="numberOfDevices"><span>{numberOfDevices}</span></label> */}
                <p>{numberOfDevices}台</p>
              </div>

            </fieldset>
            
            
          </div>
          <div className='left'>
          <p><strong>請注意，以下欄位僅能在初次設定時進行修改。</strong></p>
          </div>
          <fieldset disabled={isDisabled}>
            <legend><h3>環境及硬體規格</h3></legend>
            <div className='ldevice1'>
            <h3>本課虛擬電腦所需映像檔檔案</h3>

            <button onClick={toggleTable} className='lselect' disabled={isDisabled}>
              {isTableVisible ? '關閉選擇映像檔表格' : '選擇映像檔'}
            </button>

            {isTableVisible && (
              <div className="limage-table">
                <button className='lselect' onClick={UploadFile}>新增自定義映像檔</button>
                <table>
                  <thead>
                    <tr>
                      <th>映像檔名</th>
                      <th>映像檔類別</th>
                      {/* <th>OS Type</th> */}
                      {/* <th>Permission</th> */}
                      <th>權限</th>
                      <th>上傳者</th>
                      <th>動作</th>
                    </tr>
                  </thead>
                  <tbody>
                    { image ? image.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.type}</td>
                        {/* <td>{item.ostype}</td> */}
                        <td>{item.permission}</td>
                        <td>{item.uploader}</td>
                        {/* <td></td> */}
                        <td>
                          <button onClick={() => handleSelectImage(item.name)} className='lselect'>選擇</button>
                        </td>
                      </tr>
                    )) : null}
                  </tbody>
                </table>
              </div>
              
            )}<br />
            <div className="lselected-info">
              <p>{selectedImage}</p>
            </div>
            </div>
            <div className='lresource'>
            <div className='lresource3'>
              <h4>GPU數量</h4>
              <select
                value={gpu}
                onChange={(e) => setGpu(e.target.value)}
                className='lr3'
                disabled={isDisabled}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>
            <div className='lresource3'>
              <h4>CPU數量</h4>
              <select
                value={cpu}
                onChange={(e) => setCpu(e.target.value)}
                className='lr3'
                disabled={isDisabled}
              >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>                </select>
            </div>
            <div className='lresource3'>
              <h4>記憶體 (GB)</h4>
              <input
                type='number'
                value={mem}
                onChange={(e) => setMem(e.target.value)}
                className='lr3'
                disabled={isDisabled}
              />
            </div>
          </div>
          </fieldset>
          <button onClick={handleNextStep} className="lnextstep">下一步</button>
        </div>
        <div className='lrflex'>
          <div className="v-progress">
            <ul>
              <li className="v-progress-item inprogress">步驟一 設定虛擬電腦規格</li>
              <li className="v-progress-item">步驟二 設定虛擬電腦教室課程時間</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Device;
