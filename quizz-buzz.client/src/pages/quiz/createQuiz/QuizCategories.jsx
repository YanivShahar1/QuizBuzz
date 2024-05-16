import React, { useState, useEffect } from 'react';

function QuizCategories({ categories, onCategorySelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    setFilteredCategories(categories);
  }, [categories]);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    const filtered = categories.filter(category => category.toLowerCase().includes(searchTerm));
    setFilteredCategories(filtered);
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleCategorySelect = (category) => {
    setSearchTerm(category);
    onCategorySelect(category);
    setIsOpen(false);
  };

  const handleSuggestCategory = () => {
    const newCategory = searchTerm.trim();
    if (newCategory) {
      onCategorySelect(newCategory);
      setIsOpen(false);
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
        type="text"
        placeholder="Search categories"
        value={searchTerm}
        onClick={toggleDropdown}
        onChange={handleSearch}
      />
      {isOpen && (
        <div className="dropdown-menu" style={{ display: isOpen ? 'block' : 'none' }}>
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
}

export default QuizCategories;
