import React, { useContext, createContext, useState } from 'react';
import {
    Link,
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
} from 'react-router-dom';
import { NavLink } from 'react-router-dom';

//css
import './App.css';
import './components/admin/admin.css';
import './components/lecturer/lec.css';
import './components/teacher/teacher.css';

//public page
import Home from './components/Home';
import Login from './components/Login';
import Forgetpwd from './components/forgetpwd.js';
import Register from './components/register.js';
// import admin page
import AHome from './components/admin/home';
import Course from './components/admin/course';
import Application from './components/admin/application';
import Administrator from './components/admin/administrator';
import File from './components/admin/file';
import Account from './components/admin/account';

//import lecturer page
import Lhome from './components/lecturer/lhome';
import LFile from './components/lecturer/file';
import Class from './components/lecturer/class';
import Device from './components/lecturer/device';
import Profile from './components/lecturer/profile';
import Lschedule from './components/lecturer/schedule.js';
import Lsuccess from './components/lecturer/success.js';
import Lunschedule from './components/lecturer/lunschedule.js';
//import teacher page
import Thome from './components/teacher/thome';
import Taccount from './components/teacher/taccount';
import Tclassroom from './components/teacher/tclassroom';
import Tdevice from './components/teacher/tdevice';
import Tfile from './components/teacher/tfile';
import Tschedule from './components/teacher/tschedule';
import Tunschedule from './components/teacher/tunschedule';
import Success from './components/teacher/success.js';
import { motion } from "framer-motion";
const UserContext = createContext();
let username = localStorage.getItem('username') ?  localStorage.getItem('username').toUpperCase() : 'User';
function LNav() {
    
    const [showNavbar] = useState(false);
    const { user, setUser } = useContext(UserContext);
    return (
        <nav className="Lnavbar">
            <div className="Lcontainer">
                <div className="Llogo">
                    <Link to="/lec">{username}</Link>
                </div>
                <div className={`lnav-elements ${showNavbar && 'active'}`}>
                    <ul>
                        {/* <li>
                            <NavLink to="/lec/file">映像檔上傳</NavLink>
                            <motion.div className="underline" layoutId="underline" />
                        </li> */}
                        <li>
                            <NavLink to="/lec/device">建立虛擬電腦教室</NavLink>
                        </li>
                        <li>
                            <NavLink to="/lec/lunschedule">課程額外開機時間</NavLink>
                        </li>
                        <li>
                            <NavLink to="/lec/class">虛擬電腦總覽</NavLink>
                        </li>
                        <li>
                            <NavLink to="/lec/profile">密碼設定</NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/"
                                onClick={() => {
                                    if (!user.loggedIn) return;
                                    setUser({ loggedIn: false, level: null });
                                    localStorage.setItem('userIsLogin', 'false');
                                }}
                            >
                                登出
                            </NavLink>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>
    );
}

function ANav() {
    const [showNavbar] = useState(false);
    const { user, setUser } = useContext(UserContext);

    return (
        <nav className="navbar">
            <div className="container">
                <div className="logo">
                    <Link to="/admin">{username}</Link>
                </div>
                <div className={`nav-elements ${showNavbar && 'active'}`}>
                    <ul>
                        <li>
                            <NavLink to="/admin/application">課程申請表</NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/course">課程一覽</NavLink>
                            <motion.div className="underline" layoutId="underline" />
                        </li>
                        <li>
                            <NavLink to="/admin/file">映像檔管理</NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/administrator">管理員列表</NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/account">密碼設定</NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/"
                                onClick={() => {
                                    if (!user.loggedIn) return;
                                    setUser({ loggedIn: false, level: null });
                                    localStorage.setItem('userIsLogin', 'false');
                                }}
                            >
                                登出
                            </NavLink>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>
    );
}

function TNav() {
    const [showNavbar] = useState(false);
    const { user, setUser } = useContext(UserContext);

    return (
        <nav className="Tnavbar">
            <div className="Tcontainer">
                <div className="Tlogo">
                    <Link to="/tc">{username}</Link>
                </div>
                <div className={`Tnav-elements ${showNavbar && 'active'}`}>
                    <ul>
                        {/* <li>
                            <NavLink to="/tc/file">映像檔上傳</NavLink>
                        </li> */}
                        <li>
                            <NavLink to="/tc/devicesetting">建立虛擬電腦教室</NavLink>
                        </li>
                        {/* <li>
                            <NavLink to="/tc/unschedule">臨時開課</NavLink>
                        </li> */}
                        <li>
                            <NavLink to="/tc/classroom">虛擬電腦總覽</NavLink>
                        </li>
                        <li>
                            <NavLink to="/tc/account">密碼設定</NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/"
                                onClick={() => {
                                    if (!user.loggedIn) return;
                                    setUser({ loggedIn: false, level: null });
                                    localStorage.setItem('userIsLogin', 'false');
                                }}
                            >
                                登出
                            </NavLink>
                        </li>
                        
                    </ul>
                </div>
            </div>
        </nav>
    );
}

// PrivateRoute component to restrict access based on user level
const PrivateRoute = ({ children, levelRequired }) => {
    const { user } = useContext(UserContext);
    const location = useLocation();

    if (!user.loggedIn || user.level !== levelRequired) {
        // Redirect to login if not authorized
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    return children;
};

const Views = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgetpwd" element={<Forgetpwd />} />

            {/* Admin Routes */}
            <Route
                path="/admin"
                element={
                    <PrivateRoute levelRequired={1}>
                        <AHome />
                    </PrivateRoute>
                }
            />
            <Route
                path="/admin/course"
                element={
                    <PrivateRoute levelRequired={1}>
                        {/* <motion.div
                            key={"course"}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Course />
                        </motion.div>                         */}
                        <Course />
                    </PrivateRoute>
                }
            />
            <Route
                path="/admin/application"
                element={
                    <PrivateRoute levelRequired={1}>
                        {/* <motion.div
                            key={"application"}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Application />
                        </motion.div> */}
                        <Application />
                    </PrivateRoute>
                }
            />
            <Route
                path="/admin/file"
                element={
                    <PrivateRoute levelRequired={1}>
                        {/* <motion.div
                            key={"file"}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <File />
                        </motion.div> */}
                        <File />
                    </PrivateRoute>
                }
            />
            <Route
                path="/admin/administrator"
                element={
                    <PrivateRoute levelRequired={1}>
                        {/* <motion.div
                            key={"administrator"}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Administrator />
                        </motion.div> */}
                        <Administrator />
                    </PrivateRoute>
                }
            />
            <Route
                path="/admin/account"
                element={
                    <PrivateRoute levelRequired={1}>
                        {/* <motion.div
                            key={"account"}
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Account />
                        </motion.div> */}
                        <Account />
                    </PrivateRoute>
                }
            />

            {/* Lecturer Routes */}
            <Route
                path="/lec"
                element={
                    <PrivateRoute levelRequired={2}>
                        <Lhome />
                    </PrivateRoute>
                }
            />
            <Route
                path="/lec/file"
                element={
                    <PrivateRoute levelRequired={2}>
                        {/* <motion.div
                            key={"file"}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                        <LFile />
                        </motion.div> */}
                        <LFile />
                    </PrivateRoute>
                }
            />
            <Route
                path="/lec/class"
                element={
                    <PrivateRoute levelRequired={2}>
                        {/* <motion.div
                            key={"class"}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                        <Class />
                        </motion.div> */}
                        <Class />
                    </PrivateRoute>
                }
            />
            <Route
                path="/lec/device"
                element={
                    <PrivateRoute levelRequired={2}>
                        {/* <motion.div
                            key={"device"}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                        <Device />
                        </motion.div> */}
                        <Device />
                    </PrivateRoute>
                }
            />
            <Route
                path="/lec/lunschedule"
                element={
                    <PrivateRoute levelRequired={2}>
                        <Lunschedule />
                    </PrivateRoute>
                }
            />
            <Route
                path="/lec/profile"
                element={
                    <PrivateRoute levelRequired={2}>
                        {/* <motion.div
                            key={"profile"}
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                        <Profile />
                        </motion.div> */}
                        <Profile />
                    </PrivateRoute>
                }
            />
            <Route
                path="/lec/lschedule"
                element={
                    <PrivateRoute levelRequired={2}>
                        <Lschedule />
                    </PrivateRoute>
                }
            />
            <Route
                path="/lec/lsres"
                element={
                    <PrivateRoute levelRequired={2}>
                        <Lsuccess />
                    </PrivateRoute>
                }
            />

            {/* Teacher Routes */}
            <Route
                path="/tc"
                element={
                    <PrivateRoute levelRequired={3}>
                        {/* <motion.div
                            key={"tc"}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Thome />
                        </motion.div> */}
                        <Thome />
                    </PrivateRoute>
                }
            />
            <Route
                path="/tc/file"
                element={
                    <PrivateRoute levelRequired={3}>
                        {/* <motion.div
                            key={"file"}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Tfile />
                        </motion.div> */}
                        <Tfile />
                    </PrivateRoute>
                }
            />
            <Route
                path="/tc/devicesetting"
                element={
                    <PrivateRoute levelRequired={3}>
                        {/* <motion.div
                            key={"devicesetting"}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                           <Tdevice />
                        </motion.div> */}
                        <Tdevice />
                    </PrivateRoute>
                }
            />
            <Route
                path="/tc/unschedule"
                element={
                    <PrivateRoute levelRequired={3}>
                        <Tunschedule />
                    </PrivateRoute>
                }
            />
            <Route
                path="/tc/classroom"
                element={
                    <PrivateRoute levelRequired={3}>
                        {/* <motion.div
                            key={"classroom"}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Tclassroom />
                        </motion.div> */}
                        <Tclassroom />
                    </PrivateRoute>
                }
            />
            <Route
                path="/tc/account"
                element={
                    <PrivateRoute levelRequired={3}>
                        {/* <motion.div
                            key={"account"}
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Taccount />
                        </motion.div> */}
                        <Taccount />
                    </PrivateRoute>
                }
            />
            <Route
                path="/tc/schedule"
                element={
                    <PrivateRoute levelRequired={3}>
                        <Tschedule />
                    </PrivateRoute>
                }
            />
            <Route
                path="/tc/suc"
                element={
                    <PrivateRoute levelRequired={3}>
                        <Success />
                    </PrivateRoute>
                }
            />

            {/* Fallback route for undefined paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const LogInButtons = () => {
    // const { user, setUser } = useContext(UserContext);
    // const navigate = useNavigate();
    // const location = useLocation();

    // return (
    //     <div>
    //         <p>{`Logged In: ${user.loggedIn}`}</p>
    //         {!user.loggedIn ? (
    //             <>
    //                 <button
    //                     onClick={() => {
    //                         if (user.loggedIn) return;
    //                         setUser({ loggedIn: true, level: 1 });
    //                         localStorage.setItem('userIsLogin', 'true');
    //                         if (location.state?.from) {
    //                             navigate(location.state.from);
    //                         }
    //                     }}
    //                 >
    //                     Log In as admin
    //                 </button>

    //                 <button
    //                     onClick={() => {
    //                         if (user.loggedIn) return;
    //                         setUser({ loggedIn: true, level: 2 });
    //                         localStorage.setItem('userIsLogin', 'true');
    //                         if (location.state?.from) {
    //                             navigate(location.state.from);
    //                         }
    //                     }}
    //                 >
    //                     Log In As lecturer
    //                 </button>
    //                 <button
    //                     onClick={() => {
    //                         if (user.loggedIn) return;
    //                         setUser({ loggedIn: true, level: 3 });
    //                         localStorage.setItem('userIsLogin', 'true');
    //                         if (location.state?.from) {
    //                             navigate(location.state.from);
    //                         }
    //                     }}
    //                 >
    //                     Log In As teacher
    //                 </button>
    //             </>
    //         ) : (
    //             <button
    //                 onClick={() => {
    //                     if (!user.loggedIn) return;
    //                     setUser({ loggedIn: false, level: null });
    //                     localStorage.setItem('userIsLogin', 'false');
    //                 }}
    //             >
    //                 Log Out
    //             </button>
    //         )}

    //         <div style={{ marginBottom: '12px' }}></div>
    //     </div>
    // );
};

function App() {
    const [user, setUser] = useState(() => {
        const loggedIn = localStorage.getItem('userIsLogin') === 'true';
        const level = parseInt(localStorage.getItem('userLevel'), 10) || null;
        return { loggedIn, level };
    });

    const renderNavbar = () => {
        if (user.loggedIn) {
            if (user.level === 1) return <ANav />;
            if (user.level === 2) return <LNav />;
            if (user.level === 3) return <TNav />;
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <Router>
                {renderNavbar()}
                <LogInButtons />
                <Views />
            </Router>
        </UserContext.Provider>
    );
}

export default App;
