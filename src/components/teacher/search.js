import React, { useState } from 'react';
import './teacher.css'

const SearchBar = ({ callback }) => {
    //input:input value
    const [input, setInnerValue] = useState("");
  
    const handleSubmit = (e) => {
      e.preventDefault();
      callback(input);
    };
  
    return (
      <form className="tsearchBar" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInnerValue(e.target.value)} placeholder='請輸入port:'
        />
        <button type="submit" className="tsearchButton"><p>搜尋</p></button>
      </form>
      
    );
  };
export default SearchBar;