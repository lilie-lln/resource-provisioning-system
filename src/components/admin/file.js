import './admin.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from './search';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const fetch = async (searchValue) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_HOST}:8000/api/images`);
    let data = response.data;

    if (searchValue === "") {
      return data;
    }

    return data.filter((item) =>
      (item.type && item.type.toLowerCase().includes(searchValue.toLowerCase())) ||
      (item.name && item.name.toLowerCase().includes(searchValue.toLowerCase())) ||
      (item.permission && item.permission.toLowerCase().includes(searchValue.toLowerCase())) ||
      (item.uploader && item.uploader.toLowerCase().includes(searchValue.toLowerCase()))
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

const File = () => {
  const [data, setData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const loadData = async () => {
      const fetchedData = await fetch(searchValue);
      setData(fetchedData);
    };
    loadData();
  }, [searchValue]);

  const handleSearch = (value) => {
    setSearchValue(value);
  };


  const DisplayData = data.map((info) => (
    <tr className='table' key={info.name}>
      <td>{info.type}</td>
      <td>{info.name}</td>
      <td>{info.permission}</td>
      <td>{info.uploader}</td>
      <td>
        <button className='tons' >刪除</button>
      </td>
    </tr>
  ));
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
    setData(sortedData);
  };
  return (
    <div className='course'>
      <h1>映像檔管理</h1>
      <div className='centered'>
        <h4>這裡顯示了所有已上傳的映像檔，包括其類型、上傳者、權限。<br/>您可以選擇刪除不再需要的映像檔。請注意，一旦刪除，該映像檔將無法恢復。</h4>
        <SearchBar callback={handleSearch} />
        <div className='space'></div>
        <table className="table">
          <thead>
            <tr className='tableh'>
              <th><button className='admbut' onClick={() => sortTable('type')}>TYPE  {sortConfig.key === 'type' ? (
                sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />
                ) : (
                  <FontAwesomeIcon icon={faSort} />
                )}</button></th>
              <th><button className='admbut' onClick={() => sortTable('name')}>映像檔  {sortConfig.key === 'name' ? (
                sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />
                ) : (
                  <FontAwesomeIcon icon={faSort} />
                )}</button></th>
              <th><button className='admbut' onClick={() => sortTable('permission')}>權限  {sortConfig.key === 'permission' ? (
                sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />
                ) : (
                  <FontAwesomeIcon icon={faSort} />
                )}</button></th>
              <th><button className='admbut' onClick={() => sortTable('uploader')}>上傳者  {sortConfig.key === 'uploader' ? (
                sortConfig.direction === 'asc' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />
                ) : (
                  <FontAwesomeIcon icon={faSort} />
                )}</button></th>
                <th>編輯</th>
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

export default File;
