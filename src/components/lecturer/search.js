import React, { useState } from 'react';
import './lec.css'

const SearchBar = ({ callback }) => {
    //input:input value
    const [input, setInnerValue] = useState("");
  
    const handleSubmit = (e) => {
      e.preventDefault();
      callback(input);
    };
  
    return (
      <form className="lsearchBar" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInnerValue(e.target.value)}
        />
        <button type="submit" className="lsearchButton"><p>搜尋</p></button>
      </form>
      
    );
  };
export default SearchBar;