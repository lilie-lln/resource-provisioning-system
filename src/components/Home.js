// import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";

import './home.css'
// import Login from './Login.js'
const image = require('./assets/homen.png');
const image1 = require('./assets/infoo.jpg');
const image2 = require('./assets/workshop.jpg');
const image3 = require('./assets/admin.jpg');
const image4 = require('./assets/class.jpg');

function Home() {
    console.log(process.env);

    return(
        <>
        <div className="home">
            <div className='homelogo'>
                <p><b>CCL</b></p>
            </div>
            <div className='homegrey'>
                <div className='grid'>
                    <div className='hometext'>
                        <div className='homeh2'>
                            <h3><b>CYBERSPACE HUB</b></h3>
                        </div>
                        <div className='homeh3'>
                            <h3><b>WELCOME TO  OUR SYSTEM!</b></h3>
                        </div>
                        <div className='hometopp'>
                            <p>歡迎使用雲端學習教室，這是一個全面的教育管理系統，旨在促進教師、管理人員和研討會組織者之間的無縫協作。透過雲端技術，我們致力於提供高效的學習體驗。希望您能在這裡透過使用本系統，享受學習的每一刻！</p>
                        </div>
                        <Link to="/login" className="startnow">登入系統</Link>
                        <br/>
                    </div>
                    <div className='image'>
                        <img src={image1}/> 
                    </div>
                </div>
            </div>
            <div className='bottom'>
                <div className="margin"></div>
                {/* <div className='border'>
                    <div className='ad_block'>
                        <div className='text'>                
                            <div className='title'><p>管理者</p></div> 
                            <div className='bottom_p'><p>雲端課堂的管理員入口網站簡化了教師申請的審核和管理流程。透過應用程式審核功能，管理員可以批准、拒絕或管理常規課程和研討會的待處理請求。</p></div>  
                            <div className='image1'>
                                <img src={image3}/> 
                            </div>            
                        </div>
                    </div>
                </div> */}
                <div className='border'><div className='lec_block'>
                    <div className='text'>                
                        <div className='title'><p>學期課程</p></div>               
                        <div className='bottom_p'><p>教師可以透過我們直覺的平台有效管理學校安排的常規課程。環境設定功能可讓教師配置CPU、GPU和記憶體等硬體資源，並使用上傳檔案選項輕鬆上傳教材。</p></div>
                        <div className='image1'>
                            <img src={image4}/> 
                        </div>   
                    </div>
                </div></div>
                <div className="margin_m"></div>
                <div className='border'><div className='t_block'>
                    <div className='text'> 
                        <div className='title'><p>非學期課程</p></div>               
                        <div className='bottom_p'><p>對於工作坊和臨時課程，我們的系統使組織者能夠輕鬆安排和管理課程。配置設備設定後，教師可透過「時段選擇」功能選擇臨時時隙，確保其課程有必要的硬體資源。</p></div>
                        <div className='image1'>
                            <img src={image2}/> 
                        </div>   
                    </div>
                </div></div>
                <div className="margin"></div>
            </div>
                
        </div>

        </>
    );
}
export default Home;