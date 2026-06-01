import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './lec.css';

const fetchCourses = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/courses`);
    let data = response.data;

    if (!Array.isArray(data)) {
      data = []; 
    }
    return data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return []; 
  }
};

const fetchClassData = async (courseId) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/class/${courseId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data= await response.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;

  } catch (error) {
    console.error(`Error fetching class data for course ${courseId}:`, error);
    return [];
  }
};

function Lsuccess() {
  const [courses, setCourses] = useState([]);
  const [classData, setClassData] = useState([]);
  const location = useLocation();
  const { selectedSlots, resourceRequirements } = location.state || {};
  
  const currentUsername = localStorage.getItem('username');  // Get the current user's name

  useEffect(() => {
    const fetchAllData = async () => {
      const courseList = await fetchCourses(); 
      setCourses(courseList);

      const allClassData = await Promise.all(courseList.map(course => fetchClassData(course.id)));
      setClassData(allClassData);
      const courseArray = courseList.map(course => [course.id, course.name]);
      setCourses(courseArray);
    };

    fetchAllData();
  }, []);

  const getCourseName = (className) => {
    const course = courses.find(course => course[0] === className); 
    return course ? course[1] : className; 
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saturday','Sunday'];
  const timeSlots = ['midnight','morning', 'noon','night' ];
  const days_z = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  const timeSlots_z = {
    midnight: '午夜',
    morning: '上午',
    noon: '下午',
    night: '晚上',
  };  

  return (
    <div className='lsuccesspart'>
      <h1>排程已完成!請於選定時段登入本系統進行使用!</h1>
      <h2>選定時段：</h2>
      <ul>
        {selectedSlots && selectedSlots.length > 0 ? (
          selectedSlots.map((slot, index) => <li key={index}>{slot}</li>)
        ) : (
          <p>無選定時段</p>
        )}
      </ul>
      <h2>資源配置：</h2>
      {resourceRequirements ? (
        <ul>
          <li>CPU: {resourceRequirements.cpu}</li>
          <li>GPU: {resourceRequirements.gpu}</li>
          <li>Memory: {resourceRequirements.mem}</li>
          <li>裝置數量: {resourceRequirements.numberOfDevices}</li>
        </ul>
      ) : (
        <p>無選定資源</p>
      )}
          <div >
      <h1>課表</h1>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            {days_z.map((day, index) => (
              <th key={index}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, index) => (
            <tr key={index}>
                  <td>{timeSlots_z[time]}</td> 
                  {days.map((day, dayIndex) => (
                  <td key={dayIndex}>
                    {classData ? (
                      classData
                        .flat()
                        .filter(data => data && data.selectedSlots && data.selectedSlots.includes(`${day}-${time}`))
                        .map(data => {
                          const className = data.resource.className;
                          const courseName = getCourseName(className);
                          const isCurrentUser = className === currentUsername;
                          return (
                            <span key={className} style={{ color: isCurrentUser ? 'red' : 'black' }}>
                              {courseName}
                            </span>
                          );
                        })
                        .reduce((acc, courseElement, i) => (
                          i === 0 ? [courseElement] : [...acc, ', ', courseElement]
                        ), [])
                    ) : (
                      <span>無課程</span>
                    )}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>

  );
}

export default Lsuccess;
