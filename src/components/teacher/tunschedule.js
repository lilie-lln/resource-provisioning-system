import React, { useState } from 'react';
import moment from 'moment';
import './teacher.css';
const Tunschedule = () => {
    const currentYear = moment().year();
    const currentMonth = moment().month();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    
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
                                    type="checkbox"
                                />
                            </td>
                        ))}
                    </tr>
                );
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
            <div className='uns'>
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
                    <table border="1">
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
            </div>
            <div className='Tleft'></div>
        </div>
    );
};

export default Tunschedule;
