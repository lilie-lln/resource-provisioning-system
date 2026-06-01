import { Navigate } from 'react-router-dom';
import './lec.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


const Lfile = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filePermission, setFilePermission] = useState('public'); // Default permission

  const { gpu, cpu, mem, numberOfDevices } = useLocation().state || {};
  const navigate = useNavigate(); 

  const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Check file type and size (e.g., max 2 GB)
        const allowedTypes = ['application/x-iso9660-image', 'application/octet-stream'];
        //   if (!allowedTypes.includes(file.type) || file.size > 2e9) {
        //       setErrorMessage('Please upload a valid ISO or VM template file under 2 GB.');
        //       setSelectedFile(null);
        //       return;
        //   }
          setSelectedFile(file);
          // file name was selected
          setSuccessMessage(file.name + ' was selected');
          setErrorMessage('');
      }
  };

  const handleSubmit = (event) => {
      event.preventDefault();
      if (!selectedFile) {
          setErrorMessage('Please select a file to upload.');
          return;
      }
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('permission', filePermission);
      formData.append('className', localStorage.getItem('username'));

      // Example: Handle file upload (replace this with your upload logic)
      fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/lecture/upload`, {
          method: 'POST',
          body: formData,
      })
          .then((response) => response.json())
          .then((data) => {
              setSuccessMessage('File uploaded successfully!');
              setSelectedFile(null);
              alert('檔案上傳成功，將導向至建立虛擬環境')
              navigate('/lec/device'
            //     , {
            //     state: {
            //       gpu: Number(gpu),
            //       cpu: Number(cpu),
            //       mem: Number(mem),
            //       numberOfDevices: Number(numberOfDevices)
            //     }
            //   }
            );
          })
          .catch((error) => {
              setErrorMessage('An error occurred during upload. Please try again.');
          });
          
  };

  return (
      <div className="lupload-card">
          <h1>上傳映像檔</h1>
          <form onSubmit={handleSubmit}>
              <div className='lfilebody'>
                  <div className='lflexl'>
                    <div className='ldescribe'>
                        <h3>* 步驟說明 *</h3>
                        <p>1. <b>選擇映像檔檔案：</b>首先，點擊「選擇檔案」按鈕，從您的裝置中挑選您想要上傳的映像檔。</p>
                        <p>2. <b>選擇映像檔權限：</b>根據您的需求，選擇該映像檔權限。有兩個選項：</p>
                        <ul>
                            <li>公開使用：影片將對所有人可見。</li>
                            <li>只供本堂課程使用：影片僅限課堂內部使用，無法對外公開。</li>
                        </ul>                                
                        <p>3. <b>填寫檔案說明 & 備註：</b>在右側的文字框中，輸入對影片的描述或備註，提供關於影片內容的簡短介紹。<b>(非必填)</b></p>
                        <p>4. <b>上傳影片：</b>最後，點擊「上傳」按鈕，系統將上傳您的檔案。</p>
                    </div>
                  </div>
                  <div className='lcontentleft'>
                      <h3>請選擇您欲上傳的映像檔</h3>
                      <div className='lfilechoose'>
                          <label>選擇檔案
                              <input
                                  type="file"
                                  accept=".iso,.ovf,.vmdk"
                                  onChange={handleFileChange}
                                  id = "file"
                                  /> 
                          </label>
                      </div>

                  {errorMessage && <p className="error">{errorMessage}</p>}
                  {successMessage && <p className="success">{successMessage}</p>}
                  <div className='lpermission'>
                      <h3>檔案權限</h3>
                      <div>
                          <label>
                              <input
                                  type="radio"
                                  name="permission"
                                  value="public"
                                  checked={filePermission === 'public'}
                                  onChange={() => setFilePermission('public')}
                              />
                              公開使用
                          </label>
                          <br />
                          <label>
                              <input
                                  type="radio"
                                  name="permission"
                                  value="private"
                                  checked={filePermission === 'private'}
                                  onChange={() => setFilePermission('private')}
                              />
                              僅供本堂課程使用
                          </label>
                      </div>
                  </div>
                  </div>
                  <div className='lnotion'>
                      <h3>檔案說明＆備註</h3>
                      <textarea ></textarea>
                  </div>
                  <div className='lflexr'></div>
              </div>
              <br/><div className='luploadfile'>
                  <button type="submit">上傳</button>
              </div>
              
          </form>
      </div>
  );
};

export default Lfile;
