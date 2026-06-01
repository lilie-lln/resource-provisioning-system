import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const doLogin = async (uname, pwd) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: uname, password: pwd })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Network response was not ok');
            }

            const result = await response.json();
            if (result.message === 'Login successful') {
                localStorage.setItem('userIsLogin', 'true');
                localStorage.setItem('username', uname);
                localStorage.setItem('userLevel', result.permission);
                localStorage.setItem('userMail', result.mail);

                // Navigate based on permission level
                if (result.permission === 1) {
                    navigate('/admin');
                } else if (result.permission === 2) {
                    navigate('/lec');
                } else if (result.permission === 3) {
                    navigate('/tc');
                } else {
                    navigate('/');
                }
                window.location.reload();
            } else {
                alert('Account/Password ERROR');
            }
        } catch (error) {
            alert('ERROR: ' + error.message);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        doLogin(username, password);
    };

    // Test-login buttons: fill the fields AND submit in one click.
    // doLogin takes explicit args so it doesn't read stale (async) state.
    const autoLogin = (account, password) => {
        setUsername(account);
        setPassword(password);
        doLogin(account, password);
    };

    return (
        <div className="element-login">
            <div className='loginccl'>
                CCL
            </div>
            <div className="frame">
                <Link to="/" className="close"></Link>
                <div className="text">
                    <form onSubmit={handleSubmit}>
                        <div className="signin">
                            <p>登入</p>     
                        </div>
                        <div className="paragraph">
                            <p>課程代號/帳號</p>
                        </div>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <div className="paragraph">
                            <br/><p>密碼</p>
                        </div>          
                        <input 
                            type="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                        /> 
                        
                        <button type="submit">登入</button>
                    </form>
                    <div className="paragraph">
                        <p>繼續即表示您同意使用條款和隱私權政策。</p>
                    </div>
                    <div className="margin">
                        <Link to="/register" className="link">還沒申請帳號？</Link>
                        <Link to="/forgetpwd" className="link">忘記密碼</Link>
                    </div>

                    <div className="auto-login-links">
                        <button onClick={() => autoLogin('testAPI', 'testAPI')}>管理員身分登入（測試用）</button>
                        <button onClick={() => autoLogin('test02', 'test02')}>學期課程登入（測試用）</button>
                        <button onClick={() => autoLogin('test', 'ITM034')}>非學期課程登入（測試用）</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
