import './admin.css';
import React, { useState, useEffect } from 'react';
import SearchBar from './search';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const fetchCourses = async (searchValue) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/courses`);
    let data = response.data;

    if (!Array.isArray(data)) {
      data = []; 
    }

    if (searchValue) {
      data = data.filter((item) =>
        (item.id && item.id.toLowerCase().includes(searchValue.toLowerCase())) ||
        (item.name && item.name.toLowerCase().includes(searchValue.toLowerCase()))
      );
    }
    return data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return []; 
  }
};

const Course = () => {
  const [data, setCourses] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetchCourses(searchValue).then((data) => {
      setCourses(data);
    });
  }, [searchValue]);

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const DisplayData = data.length > 0 ? data.map((info) => (
    <tr className='table' key={info.id}>
      <td>{info.name}</td>
      <td>{info.id}</td>
    </tr>
  )) : (
    <tr>
      <td colSpan="2">No data available</td>
    </tr>
  );

  const sortTable = (key) => {
    let sortedData = [...data];
    let direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';

    sortedData.sort((a, b) => {
      let x = a[key];
      let y = b[key];

      if (typeof x === 'string') {
        x = x.toLowerCase();
        y = y.toLowerCase();
      }

      return direction === 'asc' ? (x > y ? 1 : -1) : (x < y ? 1 : -1);
    });

    setSortConfig({ key, direction });
    setCourses(sortedData);
  };

  return (
    <div className='course'>
      <h1>課程列表</h1>
      <div className='centered'>
        <h4>所有課程的帳號和名稱將顯示在下方的列表中。</h4>
        <SearchBar callback={handleSearch} />
        <div className='space'></div>
        <table className="table">
          <thead>
            <tr className='tableh'>
              <th ><button className='admbut' onClick={() => sortTable('name')}>課程名稱  {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />
              ) : (
                <FontAwesomeIcon icon={faSort} />
                )}</button></th>
              <th ><button className='admbut' onClick={() => sortTable('id')}>代號  {sortConfig.key === 'id' ? (
                sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />
                ) : (
                  <FontAwesomeIcon icon={faSort} />
                )}</button></th>
            </tr>
          </thead>
          <tbody>
            {DisplayData}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Course;