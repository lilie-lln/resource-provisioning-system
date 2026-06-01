import React, { useState } from 'react';
import moment from 'moment';
import './lec.css';

const Lunschedule = () => {
    const currentYear = moment().year();
    const currentMonth = moment().month();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    
    const years = Array.from(new Array(2), (val, index) => currentYear + index); // 只顯示當前年和明年
    const months = [
        '一月', '二月', '三月', '四月', '五月', '六月', 
        '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];

    const handleYearChange = (event) => {
        setSelectedYear(parseInt(event.target.value));
        if (parseInt(event.target.value) === currentYear) {
            setSelectedMonth(currentMonth);
        } else {
            setSelectedMonth(0); // 如果選擇明年，重置為一月
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

    const isPastTimeSlot = (year, month, day, label) => {
        // Parse the current day and time (e.g., "00:00~05:59" becomes an array [00, 05, 59])
        const [start, end] = label.split("~").map(time => moment(`${year}-${month + 1}-${day} ${time}`, "YYYY-MM-DD HH:mm"));
        
        // Check if the current time is past the end time of the slot
        return moment().isAfter(end);
    };
    
    const generateDaysTable = (year, month) => {
        const daysInMonth = getDaysInMonth(year, month);
        const days = Array.from(new Array(daysInMonth), (val, index) => index + 1);
    
        return days
            .filter(day => !isPastDate(year, month, day)) // Filter out past dates
            .map(day => (
                <tr key={day}>
                    <td>{`${month + 1}/${day}`}</td>
                    {timeLabels.map((label) => (
                        <td key={label}>
                            <input 
                                type="checkbox"
                                disabled={isPastTimeSlot(year, month, day, label)} // Disable only past time slots
                            />
                        </td>
                    ))}
                </tr>
            ));
    };
    


    const timeLabels = ['00:00~05:59', '06:00~11:59', '12:00~17:59', '18:00~23:59'];

    return (
        <div className='lresource'>
            <div className='llleft'>
                <div className='lsj'>
                    <h3>* 填寫說明 *</h3>
                    <p className='llp'>若您想在非正式課程期間，繼續使用電腦資源，請先於此表選擇欲使用的時間區段。<br/>裝置的硬體環境以及規格將和先前設定相同。<br/>其中，若欄位顯示為不可勾選之框格，則表示硬體需求已超過該時間段之剩餘使用量。</p>
                </div>
            </div>

            <div className='luns'>
            <h1>臨時課程</h1>
                <div className='llluns'>
                    {/* <div className='lsj'>
                        <p className='llp'>若您想在非正式課程期間，繼續使用電腦資源，請先於此表選擇欲使用的時間區段。裝置的硬體環境以及規格將和先前設定相同。其中，若欄位顯示為不可勾選之框框，則表示硬體需求已超過該時間段之剩餘使用量。</p>
                    </div> */}
                    <div className='lluns'>
                        <div className='paddin'>
                            <label>請選擇年: </label>
                            <select value={selectedYear} onChange={handleYearChange}>
                                {years.map((year, index) => (
                                    <option key={index} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div className='paddin'>
                            <label>請選擇月份: </label>
                            <select value={selectedMonth} onChange={handleMonthChange}>
                                {months.map((month, index) => (
                                    // 禁用當前年份的過去月份和未來年份的未來月份
                                    (selectedYear > currentYear || (selectedYear === currentYear && index >= currentMonth)) &&
                                    (selectedYear < currentYear + 1 || (selectedYear === currentYear + 1 && index <= currentMonth)) && (
                                        <option key={index} value={index}>{month}</option>
                                    )
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <h2>{selectedYear} {months[selectedMonth]}</h2>

                <div className='lunschedule'>
                    <h3>請選擇排程日期:</h3>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>日期</th>
                                {timeLabels.map((label) => (
                                    <th key={label}>{label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {generateDaysTable(selectedYear, selectedMonth)}
                        </tbody>
                    </table>
                    <button type='submit' className='lsub'>提交</button>
                </div>
            </div>
            <div className='lleft'>

            </div>
        </div>
    );
};

export default Lunschedule;
