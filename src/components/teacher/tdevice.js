import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './teacher.css';

function Tdevice() {
  const [isTableVisible, setTableVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('沒有選擇映像檔');
  const [numberOfDevices, setNumberOfDevices] = useState('');
  const [gpu, setGpu] = useState(0);
  const [cpu, setCpu] = useState(0);
  const [mem, setMem] = useState(0);
  const [image, setImage] = useState([]);
  const username = localStorage.getItem('username');
  const navigate = useNavigate(); // Initialize the navigate function

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
        });
        console.log(image);
      });
  }, []);

  const toggleTable = () => {
    setTableVisible(!isTableVisible);
  };

  const handleSelectImage = (imageName) => {
    setSelectedImage(imageName);
    setTableVisible(false);
  };

  // 新增 UploadFile 函數
  const UploadFile = () => {
    navigate('/tc/file', {
      state: {
        gpu: Number(gpu),
        cpu: Number(cpu),
        mem: Number(mem),
        numberOfDevices: Number(numberOfDevices)
      }
    });
  };

  const handleSubmitUnscheduleTask = () => {
    navigate('/tc/schedule', {
      state: {
        gpu: Number(gpu),
        cpu: Number(cpu),
        mem: Number(mem),
        selectedImage: selectedImage,
        numberOfDevices: Number(numberOfDevices)
      }
    });
  };

  return (
    <>
      <div className='center'>
        <div className='lflex'>
          <div className='describedevice'>
            <h3>* 步驟說明 *</h3>
            <p>1. <b>輸入所需裝置數量：</b>在「所需裝置數量」欄位中，請輸入您所需的裝置數量。此數量將決定您將要創建的裝置數。</p>
            <p>2. <b>選擇映像檔案：</b>在「本課裝置所需映像檔案」部分，點擊「選擇映像檔」按鈕，表格中為您剛剛添加或其他老師放置公共區的映像檔案，選擇適合此課程所需的檔案後，系統會顯示已選取的檔案名稱。</p>                              
            <p>3. <b>配置硬體資源：</b>接著，在「GPU數量」、「CPU數量」以及「記憶體 (GB)」的欄位中，分別輸入您所需的資源。這些資源將用於配置裝置的硬體性能。</p>
            <p>4. <b>創建裝置：</b>最後，確認所有配置正確無誤後，點擊「創建」按鈕，若出現「創建成功」即為成功創建好裝置。</p>
          </div>
        </div>
        <div className='device'>
          <div className='device1'>
            <h1>設定虛擬電腦規格<br /></h1>
            <h3>指定虛擬機器數量</h3>
            <div className='tdevnum-container'>
              <input
                type='range' 
                min="1" 
                max="50" 
                step="1" 
                value={numberOfDevices}
                onChange={(e) => setNumberOfDevices(e.target.value)}
                className='slider' 
              />
              <p>{numberOfDevices}</p>
            </div>


          </div>
          <div className='device1'>
            <h3>本課裝置所需映像檔檔案</h3>

            <button onClick={toggleTable} className='select'>
              {isTableVisible ? '關閉選擇映像檔表格' : '選擇映像檔'}
            </button>

            {isTableVisible && (
              <div className="image-table">
                <p><button className='select' onClick={UploadFile}>新增自定義映像檔</button></p>
                <table>
                  <thead>
                    <tr>
                      <th>映像檔檔案名</th>
                      <th>映像檔類別</th>
                      <th>上傳者</th>
                      <th>動作</th>
                    </tr>
                  </thead>
                  <tbody>
                    { image ? image.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.type}</td>
                        <td>{item.permission}{item.uploader}</td>
                        <td>
                          <button onClick={() => handleSelectImage(item.name)} className='selectthis'>選擇</button>
                        </td>
                      </tr>
                    )) : null}
                  </tbody>
                </table>
              </div>
            )}

            <div className="selected-info">
              <p>{selectedImage}</p>
            </div>
          </div>
          <br />
          <div className='resource'>
            <div className='resource3'>
              <h4>GPU數量</h4>
              <input
                type='number'
                value={gpu}
                onChange={(e) => setGpu(e.target.value)}
                className='r3'
              />
            </div>
            <div className='resource3'>
              <h4>CPU數量</h4>
              <input
                type='number'
                value={cpu}
                onChange={(e) => setCpu(e.target.value)}
                className='r3'
              />
            </div>
            <div className='resource3'>
              <h4>記憶體 (GB)</h4>
              <input
                type='number'
                value={mem}
                onChange={(e) => setMem(e.target.value)}
                className='r3'
              />
            </div>
          </div>
          <br />
          <button onClick={handleSubmitUnscheduleTask} className="nextstep">創建</button>
        </div>
        <div className='rflex'></div>
      </div>
    </>
  );
}

export default Tdevice;
