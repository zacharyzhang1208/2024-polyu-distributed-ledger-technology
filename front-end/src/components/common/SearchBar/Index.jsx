import React from 'react';
import '../../../css/SearchBar.css';

const SearchBar = ({ searchTerm, onSearch, sortBy, onSort }) => {
    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={onSearch}
                className="search-input"
            />
            <select 
                value={sortBy}
                onChange={onSort}
                className="sort-select"
            >
                <option value="name">Sort by Name</option>
                <option value="credits">Sort by Credits</option>
                <option value="semester">Sort by Semester</option>
            </select>
        </div>
    );
};

export default SearchBar; 