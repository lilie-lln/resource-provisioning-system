import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './lec.css';

function Lschedule() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gpu, cpu, mem, selectedImage, numberOfDevices,timeSlots } = location.state || {};
  const [scheduleData , setScheduleData] = useState([]);
  const [schedule, setSchedule] = useState({});

  const toggleCheckbox = (day, slot) => {
    const key = `${day}-${slot}`;
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [key]: !prevSchedule[key],
    }));
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/resource`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      setScheduleData(data);
    })
  }, []);



  const handleSubmit = (event) => {
    event.preventDefault();
    // date local time(yyyy-mm-dd hh:mm:ss)
    const currentTime = {
      currentTime: new Date().toLocaleString()
    }

    const selectedSlots = Object.entries(schedule)
      .filter(([_, value]) => value) 
      .map(([key]) => key); 

    const resourceRequirements = {
      className: localStorage.getItem('username'),
      cpu: cpu,
      gpu: gpu,
      mem: mem,
      selectedImage: selectedImage,
      numberOfDevices: numberOfDevices,
    };
    // conpare selectedSlots with timeSlots
    

    if(timeSlots.length !==0 && JSON.stringify(selectedSlots) !== JSON.stringify(timeSlots)){
      console.log('Selected Slots:', selectedSlots);
      console.log('TimeSlots:', timeSlots);
      alert(`因目前該門課開課時間已排定，請僅勾選初次設定之時間區段`);
      return false; 
    }
    console.log('Selected Slots:', selectedSlots);
    console.log('Resource Requirements:', resourceRequirements);
    const sendData = { selectedSlots, resourceRequirements , currentTime};
    let response = fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/lecture/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendData),
    });
    console.log(response);

    // Navigate to Success component with selected data
    navigate('/lec/lsres', { state: { selectedSlots, resourceRequirements } });
  };

  const timeLabels = ['00:00~05:59', '06:00~11:59', '12:00~17:59', '18:00~23:59'];
  const day_z = {
    'Monday': '星期一',
    'Tuesday': '星期二',
    'Wednesday': '星期三',
    'Thursday': '星期四',
    'Friday': '星期五',
    'Saturday': '星期六',
    'Sunday': '星期日'
  };
  const time_slot = {
    'midnight': timeLabels[0], 
    'morning': timeLabels[1],  
    'noon': timeLabels[2], 
    'night': timeLabels[3]   
  };
  const time_z = (slots) => {
    return slots.map(slot => {
      const [day, time] = slot.split('-');
  
      const zday = day_z[day];
      const ztime = time_slot[time];
  
      return `${zday} ${ztime}、`;
    });
  };
  const handleBack = () => {
    navigate('/lec/device');
  };
  const exist = () => {
    if (timeSlots!=null) {
      const n_time=time_z(timeSlots);
      console.log(timeSlots);
      return <div><h4>因目前該門課開課時間已排定為{n_time}</h4>
        <h4>請僅勾選與上述相同之時間區段</h4></div>;
    }
  };
  return (
    <div className='lresource'>
      <div className='lleft'></div>
      <div className="lschedule">
        <h1>設定虛擬電腦教室課程時間</h1>
        {exist()}
        <form onSubmit={handleSubmit}>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                {timeLabels.map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scheduleData.map((dayData) => (
                <tr key={dayData.day}>
                  <td>{day_z[dayData.day]}</td>
                  {dayData.detail.map((slotDetail) => {

                    return (
                      <td key={slotDetail.slots}>
                        <input
                          type="checkbox"
                          checked={schedule[`${dayData.day}-${slotDetail.slots}`] || false}
                          onChange={() => toggleCheckbox(dayData.day, slotDetail.slots)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleBack} className="lback">上一頁</button>
          <button type="submit" className='lsubtime'>確認</button>
        </form>
      </div>
      <div className='lleft'>
        <div className="v-progress">
          <ul>
            <li className="v-progress-item completed">步驟一 設定虛擬電腦規格</li>
            <li className="v-progress-item inprogress">步驟二 設定虛擬電腦教室課程時間</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Lschedule;