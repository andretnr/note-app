import React from 'react'

const Header = ({ onAddNote, totalNotes, onExportNotes, onToggleSync }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="app-title">📝 Bloco de Anotações</h1>
        <div className="header-stats">
          <span className="note-count">{totalNotes} anotações</span>
        </div>
        <div className="header-actions">
          <button 
            onClick={onAddNote} 
            className="btn btn-primary"
            title="Nova anotação (Ctrl+N)"
          >
            ➕ Nova
          </button>
          <button 
            onClick={onExportNotes} 
            className="btn btn-secondary"
            title="Exportar (Ctrl+E)"
          >
            💾 Exportar
          </button>
          <button 
            onClick={onToggleSync} 
            className="btn btn-secondary"
            title="Sincronização (Ctrl+S)"
          >
            🔄 Sync
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header