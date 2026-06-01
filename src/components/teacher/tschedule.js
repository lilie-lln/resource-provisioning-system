// import React, { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import scheduleData from './data/resource.json'; // Import the JSON file

// function Tschedule() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { gpu, cpu, mem, selectedImage, numberOfDevices } = location.state || {};

//   const [schedule, setSchedule] = useState({});

//   const toggleCheckbox = (day, slot) => {
//     const key = `${day}-${slot}`;
//     setSchedule((prevSchedule) => ({
//       ...prevSchedule,
//       [key]: !prevSchedule[key],
//     }));
//   };

//   const isResourceAvailable = (detail) => {
//     return (
//       detail.availableGpu >= gpu &&
//       detail.availableCpu >= cpu &&
//       detail.availableMem >= mem
//     );
//   };

//   const handleSubmit = (event) => {
//     event.preventDefault();

//     const selectedSlots = Object.entries(schedule)
//       .filter(([_, value]) => value) 
//       .map(([key]) => key); 

//     const resourceRequirements = {
//       cpu: cpu,
//       gpu: gpu,
//       mem: mem,
//       selectedImage: selectedImage,
//       numberOfDevices: numberOfDevices
//     };

//     console.log('Selected Slots:', selectedSlots);
//     console.log('Resource Requirements:', resourceRequirements);

//     // Navigate to Success component with selected data
//     navigate('/tc/suc', { state: { selectedSlots, resourceRequirements } });
//   };

//   const timeLabels = ['00:00~05:59', '06:00~11:59', '12:00~17:59', '18:00~23:59'];
//   const handleBack = () => {
//     navigate('/tc/device');
//   };
//   return (
//     <div className='resource'>
//       <div className='Tleft'></div>
//       <div className="schedule">
//         <h1>Select Time Slots</h1>
//         <form onSubmit={handleSubmit}>
//           <table>
//             <thead>
//               <tr>
//                 <th>Day</th>
//                 {timeLabels.map((label) => (
//                   <th key={label}>{label}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {scheduleData.map((dayData) => (
//                 <tr key={dayData.day}>
//                   <td>{dayData.day}</td>
//                   {dayData.detail.map((slotDetail) => {
//                     const available = isResourceAvailable(slotDetail);

//                     return (
//                       <td key={slotDetail.slots}>
//                         <input
//                           type="checkbox"
//                           checked={schedule[`${dayData.day}-${slotDetail.slots}`] || false}
//                           onChange={() => toggleCheckbox(dayData.day, slotDetail.slots)}
//                           disabled={!available}
//                         />
//                       </td>
//                     );
//                   })}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <button onClick={handleBack} className="back">Back</button>
//           <button type="submit" className='sub'>Submit</button>
//         </form>
//       </div>
//       <div className='Tleft'></div>
//     </div>
//   );
// }

// export default Tschedule;

import React, { useState } from 'react';
import moment from 'moment';
import './teacher.css';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';

const Tschedule = () => {
    const currentYear = moment().year();
    const currentMonth = moment().month();
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedSlots, setSchedule] = useState([]);
    const { gpu, cpu, mem, selectedImage, numberOfDevices, timeSlots } = location.state || {};
    const years = Array.from(new Array(2), (val, index) => currentYear + index); // Only current year and next year
    const months = moment.months();

    const handleYearChange = (event) => {
        setSelectedYear(parseInt(event.target.value));
        if (parseInt(event.target.value) === currentYear) {
            setSelectedMonth(currentMonth);
        } else {
            setSelectedMonth(0); // Reset to January if next year is selected
        }
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(parseInt(event.target.value));
    };

    const getDaysInMonth = (year, month) => {
        return moment(`${year}-${month + 1}`, "YYYY-MM").daysInMonth();
    };

    const isPastDate = (year, month, date) => {
        const selected = moment(`${year}-${month + 1}-${date}`, "YYYY-MM-DD");
        return selected.isBefore(moment().startOf('day'));
    };

    const generateDaysTable = (year, month) => {
        const daysInMonth = getDaysInMonth(year, month);
        const days = Array.from(new Array(daysInMonth), (val, index) => index + 1);

        return days
            .filter(day => !isPastDate(year, month, day)) // Filter out past dates
            .map(day => {
                return (
                    <tr key={day}>
                        <td>{`${month + 1}/${day}`}</td>
                        {timeLabels.map((label) => (
                            <td key={label}>
                                <input 
                                    type="checkbox" id='slot' value={`${year}-${month + 1}-${day} ${label}`} onChange={updateSchedule(day, month + 1, year, label)}
                                />
                            </td>
                        ))}
                    </tr>
                );
            });
    };
    const updateSchedule = (day, month, year, time) => {
        const maptimetoslot = {
            '00:00~05:59': "midnight",
            '06:00~11:59': "morning",
            '12:00~17:59': "noon",
            '18:00~23:59': "night"
        }
        let newtime = maptimetoslot[time];
        let key = `${year}-${month}-${day} ${newtime}`;
        return () => {
            setSchedule((prevSchedule) => {
                if (prevSchedule.includes(key)) {
                    return prevSchedule.filter(slot => slot !== key);
                } else {
                    return [...prevSchedule, key];
                }
            });
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const currentTime = {
          currentTime: new Date().toLocaleString(),
        };
        const resourceRequirements = {
          className: localStorage.getItem('username'),
          cpu: cpu,
          gpu: gpu,
          mem: mem,
          selectedImage: selectedImage,
          numberOfDevices: numberOfDevices,
        };
    
        const sendData = { selectedSlots, resourceRequirements, currentTime };
        console.log(sendData);
        fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/teacher/unschedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sendData),
        })
        .then((res) => res.json())
        .then((data) => {
          // if status is not successful
          if (data.status !== 'success') {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: data.error,
              timer: 2000,
              
            });
            
            return;
          } else {
          // if successful
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: '課程時間設定成功',
              timer: 2000,
            });
            
            navigate('/lec/lsres', { state: { selectedSlots, resourceRequirements } });
          }
        });
      };
    

    const timeLabels = ['00:00~05:59', '06:00~11:59', '12:00~17:59', '18:00~23:59'];

    return (
        <div className='resource'>
            <div className='Tleft'></div>
            {/* <div>
                <label>Selected Month: </label>
                <input type="text" readOnly value={`${selectedYear}-${selectedMonth + 1}`} />
            </div> */}
            <form className='uns' onSubmit={handleSubmit}>
                <div className='paddin'>
                    <label>Year: </label>
                    <select value={selectedYear} onChange={handleYearChange}>
                        {years.map((year, index) => (
                            <option key={index} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div className='paddin'>
                    <label>Month: </label>
                    <select value={selectedMonth} onChange={handleMonthChange}>
                        {months.map((month, index) => (
                            // Disable months in the past for the current year, and future months for the next year
                            (selectedYear > currentYear || (selectedYear === currentYear && index >= currentMonth)) &&
                            (selectedYear < currentYear + 1 || (selectedYear === currentYear + 1 && index <= currentMonth)) && (
                                <option key={index} value={index}>{month}</option>
                            )
                        ))}
                    </select>
                </div>

                <h2>{selectedYear} {months[selectedMonth]}</h2>
                <div className='unschedule'>
                    <h3>Choose time slots:</h3>
                    <table border="1" id="scheduletable">
                        <thead>
                            <tr>
                                <th>Day</th>
                                {timeLabels.map((label) => (
                                    <th key={label}>{label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {generateDaysTable(selectedYear, selectedMonth)}
                        </tbody>
                    </table>
                    <button type='submit' className='sub'>submit</button>
                </div>
            </form>
            <div className='Tleft'></div>
        </div>
    );
};

export default Tschedule;
