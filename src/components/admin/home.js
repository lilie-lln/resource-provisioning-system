import React, {useState, useEffect } from 'react';
import './admin.css';
function AHome(){
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || '';
    setUsername(storedUsername);
  }, []);

  return (
    <>
    <div className="home">
      <div className='intro'>
        <h1 >CYBERSPACE HUB</h1>
        <h2>您好， {username}！</h2>
        <h3>您現在登入身份為管理員。</h3>
        <h2>使用說明:</h2>
        <p>歡迎使用本軟體！透過點擊頁面上方導覽列各按鈕標籤，您可完成以下操作：</p>
        <ul>
          <li><strong>課程一覽</strong>:能閱覽目前所有的課程，及其相對應的代號，如要查看，可點擊上方"課程一覽"。</li>
          <li><strong>課程申請</strong>:需admin去審核是否要通過該課程來允許進去本系統，點擊上方"課程申請"進入。</li>
          <li><strong>映像檔總覽</strong>:可閱覽所有使用者上傳的映像檔，點擊上方"映像檔總覽"進入。</li>
          <li><strong>管理者設定</strong>:可新增/刪除以及查看當前所有的admin，點擊上方"管理者設定"進入。</li>
          <li><strong>帳號設定</strong>:修改您自己的email或密碼，點擊上方"帳號設定"進入。</li>
        </ul>
      </div>
      <div className='left'></div>
      <div className='right'></div>
    </div>
    </>
  );
}

 
export default AHome;