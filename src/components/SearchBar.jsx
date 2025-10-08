import React from 'react'

const SearchBar = ({ searchTerm, setSearchTerm, searchType, setSearchType }) => {
  return (
    <div className="search-bar">
      <div className="search-input-group">
        <input
          type="text"
          placeholder={searchType === 'subject' ? 'Buscar por assunto...' : 'Buscar por data (dd/mm/aaaa)...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="search-select"
        >
          <option value="subject">Por Assunto</option>
          <option value="date">Por Data</option>
        </select>
      </div>
    </div>
  )
}

export default SearchBar