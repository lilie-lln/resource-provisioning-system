import React, { useState } from 'react';
import './teacher.css'; // Ensure you have this CSS file for styling

const Tfile = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [filePermission, setFilePermission] = useState('public'); // Default permission

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file type and size (e.g., max 2 GB)
            // const allowedTypes = ['application/x-iso9660-image', 'application/octet-stream'];
            // if (!allowedTypes.includes(file.type) || file.size > 2e9) {
            //     setErrorMessage('Please upload a valid ISO or VM template file under 2 GB.');
            //     setSelectedFile(null);
            //     return;
            // }
            setSelectedFile(file);
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
        formData.append("className", localStorage.getItem('username'));

        // Example: Handle file upload (replace this with your upload logic)
        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                setSuccessMessage('File uploaded successfully!');
                setSelectedFile(null);
            })
            .catch((error) => {
                setErrorMessage('An error occurred during upload. Please try again.');
            });
    };

    return (
        <div className="upload-card">
            <h1>上傳映像檔</h1>
            <form onSubmit={handleSubmit}>
                <div className='filebody'>
                    <div className='flexl'>
                        <div className='describe'>
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
                    <div className='contentleft'>
                        <h3>請選擇您欲上傳的映像檔</h3>
                        <div className='filechoose'>
                            <label>選擇檔案
                                <input
                                    type="file"
                                    accept=".iso,.ovf,.vmdk"
                                    onChange={handleFileChange}
                                    /> 
                            </label>
                        </div>

                        {errorMessage && <p className="error">{errorMessage}</p>}
                        {successMessage && <p className="success">{successMessage}</p>}
                        <div className='permission'>
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
                                        value="class"
                                        checked={filePermission === 'private'}
                                        onChange={() => setFilePermission('private')}
                                    />
                                    只供本堂課程使用
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className='notion'>
                        <h3>檔案說明＆備註</h3>
                        <textarea ></textarea>
                    </div>
                    <div className='flexr'></div>
                </div>
                <br/><div className='uploadfile'>
                    <button type="submit">上傳</button>
                </div>
                
            </form>
        </div>
    );
};

export default Tfile;
