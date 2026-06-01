import React, {useState, useEffect } from 'react';
import './teacher.css';
function Thome(){
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || '';
    setUsername(storedUsername);
  }, []);

  return (
    <>
    <div className="Thome">
      <div className='intro'>
        <h1 >CYBERSPACE HUB</h1>
        <h2>您好， {username}！</h2>
        <h3>您現在登入身份為非學期課程負責人。</h3>
        <h2>使用說明:<br /></h2>
        <p>歡迎使用本軟體！透過點擊頁面上方導覽列各按鈕標籤，您可完成以下操作：</p>
        <ul>
          <li><b>映像檔上傳</b>:若授課教師欲使用自己的映像檔作為上課環境，則需在此處上傳映像檔，點擊上方"映像檔上傳"進入。</li>
          <li><b>建立虛擬電腦教室</b>:教師在上課前需先設定好上課的環境以及所需的硬體規格，點擊上方"環境設定"進入。</li>
          <li><b>虛擬電腦總覽</b>:可閱覽所有裝置的細項以及狀態，點擊上方"裝置總覽"進入。</li>
          <li><b>密碼設定</b>:修改您自己的密碼，點擊上方"密碼設定"進入。</li>
        </ul>

      </div>
      <div className='Tleft'></div>
      <div className='Tright'></div>
    </div>
    </>
  );
}

 
export default Thome;