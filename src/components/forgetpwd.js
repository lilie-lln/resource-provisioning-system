import React, { useState } from 'react';
import './forgetpwd.css';
import { Link } from "react-router-dom";

function Forgetpwd() {
    const [isSendDisabled, setSendDisabled] = useState(false);

    const handleSendClick = () => {
        setSendDisabled(true);
        // Add any other logic you want to execute on button click
    };
    return (
        <div className="element-login">
            <div className='logoccl'>
                CCL
            </div>
            <div className="frame">
                <Link to="/Login" className="close"></Link>
                <div className="textt">
                    <div className="forget">
                        <p>忘記密碼</p>
                    </div>
                    <div className="info">
                        <p>當您忘記密碼時，請前往管理大樓四樓尋找管理員以進行密碼重置。管理員將會協助您確認身份並重設新密碼，確保您的帳號安全。為避免長時間等待，建議您先行確認管理員的工作時間。</p>
                    </div>
                    {/* <table className='mail'>
                        <tr>
                            <td><input type="text" placeholder="ex:xxx@cgu.edu.com"/></td>
                            <td class="btn">
                                <div class="submit" onClick={handleSendClick} disabled={isSendDisabled}>SEND</div>
                            </td>
                        </tr>
                    </table>
                    <table>
                        <tr>
                            <td><input type="text" placeholder="Enter verification code."/></td>
                        </tr>
                    </table>
                    <button className="next" >NEXT</button> */}
                </div>
            </div>
        </div>
    );
}

export default Forgetpwd;
