import React from 'react'

const SearchBar = ({ searchTerm, onSearchChange, searchType, onSearchTypeChange }) => {
  return (
    <div className="search-bar">
      <div className="search-input-group">
        <input
          type="text"
          placeholder={searchType === 'subject' ? 'Buscar por assunto...' : 
                      searchType === 'date' ? 'Buscar por data (dd/mm/aaaa)...' : 
                      'Buscar no conteúdo...'}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        <select
          value={searchType}
          onChange={(e) => onSearchTypeChange(e.target.value)}
          className="search-select"
        >
          <option value="subject">Por Assunto</option>
          <option value="content">Por Conteúdo</option>
          <option value="date">Por Data</option>
        </select>
      </div>
    </div>
  )
}

export default SearchBar