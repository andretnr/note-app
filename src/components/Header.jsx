import React from 'react'

const Header = ({ onAddNote, totalNotes, onExportNotes, onImportNotes, onSyncConfig }) => {
  const handleImportClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        onImportNotes(file)
      }
    }
    input.click()
  }

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
            onClick={handleImportClick} 
            className="btn btn-secondary"
            title="Importar arquivo JSON (Ctrl+I)"
          >
            📥 Importar
          </button>
          <button 
            onClick={onSyncConfig}
            className="btn btn-secondary btn-icon"
            title="Configurações de Sincronização"
          >
            ⚙️
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header