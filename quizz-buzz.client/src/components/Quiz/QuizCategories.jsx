import React, { useState, useEffect, useRef } from 'react';
import './QuizCategories.css';
import QuizService from '../../services/QuizService';


function QuizCategories({ categories, onCategorySelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const dropdownRef = useRef(null); // Ref to store reference to input element
  
  useEffect(() => {
    // Initialize filteredCategories with the initial categories
    setFilteredCategories(categories);
  }, [categories]);

  useEffect(() => {
    const filtered = categories.filter(category => category.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredCategories(filtered);
  }, [searchTerm]);


  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (dropdownRef.current) {
        // Check if the dropdownRef exists and if the clicked target is not within the dropdownRef
        if (!dropdownRef.current.contains(event.target)) {
          console.log('Clicked outside the dropdown element');
          setIsDropdownOpen(false);
        } else {
          console.log('Clicked inside the dropdown element');
        }
      } else {
        console.log('Dropdown ref is not available');
      }
    };
  
    // Attach the event listener to the document
    console.log('Adding event listener for mousedown');
  
    document.addEventListener('mousedown', handleClickOutsideDropdown);
  
    // Cleanup function to remove event listener when component unmounts
    return () => {
      console.log('Removing event listener for mousedown');
      document.removeEventListener('mousedown', handleClickOutsideDropdown);
    };
  }, []);
  

  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
  
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCategorySelect = (category) => {
    console.log(`handleCategorySelect, ${category}`);
    setSearchTerm(category);
    onCategorySelect(category);
    setIsDropdownOpen(false);
  };

  const handleSuggestCategory = () => {
    const newCategory = searchTerm.trim();
    console.log(`handleSuggestCategory, ${newCategory}`);

    if (newCategory) {
      onCategorySelect(newCategory);
      setIsDropdownOpen(false);
      // TODO : implement QuizService.suggestCategory(newCategory);

    }
  };

  const renderDropdownContent = () => {
    if (filteredCategories.length === 0) {
      return (
        <div>
          <div>No categories found.</div>
          <div onClick={handleSuggestCategory}>+ Suggest a category</div>
        </div>
      );
    }
    return (
      <div>
        {filteredCategories.map((category, index) => (
          <div key={index} onClick={() => handleCategorySelect(category)}>{category}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="dropdown">
      <input
        ref={dropdownRef} 
        type="text"
        placeholder="Search categories"
        value={searchTerm}
        onClick={toggleDropdown}
        onChange={handleSearch}
      />
      {isDropdownOpen && (
        <div className="dropdown-menu" style={{ display: isDropdownOpen ? 'block' : 'none' }}>
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
}

export default QuizCategories;
