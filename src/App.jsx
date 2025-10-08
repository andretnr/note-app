import React, { useState, useEffect } from 'react'
import './styles/App.css'
import useIndexedDB from './hooks/useIndexedDB'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import NoteForm from './components/NoteForm'
import NoteItem from './components/NoteItem'
import SyncConfigModal from './components/SyncConfigModal'

function App() {
  const { 
    notes, 
    isLoading, 
    error,
    addNote, 
    updateNote, 
    deleteNote, 
    searchNotes,
    exportNotes: exportNotesDB,
    importNotes
  } = useIndexedDB()

  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState('subject')
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [showSyncConfig, setShowSyncConfig] = useState(false)

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setShowForm(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        exportNotesDB()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault()
        handleImportClick()
      }
      if (e.key === 'Escape' && showForm) {
        setShowForm(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showForm, exportNotesDB])

  // Filtrar anotações localmente
  const filteredNotes = notes.filter(note => {
    if (!searchTerm.trim()) return true
    
    if (searchType === 'subject') {
      return note.subject.toLowerCase().includes(searchTerm.toLowerCase())
    } else if (searchType === 'date') {
      const noteDate = new Date(note.createdAt).toLocaleDateString('pt-BR')
      return noteDate.includes(searchTerm)
    } else if (searchType === 'content') {
      return note.content.toLowerCase().includes(searchTerm.toLowerCase())
    }
    
    return true
  })

  // Mostrar loading se ainda carregando dados
  if (isLoading) {
    return (
      <div className="app">
        <Header 
          onAddNote={() => {}}
          totalNotes={0}
          onExportNotes={() => {}}
          onToggleSync={() => {}}
        />
        <main className="main-content">
          <div className="loading-state">
            <div className="loader"></div>
            <p>Carregando anotações...</p>
          </div>
        </main>
      </div>
    )
  }

  // Handlers
  const handleAddNote = () => {
    setEditingNote(null)
    setShowForm(true)
  }

  const handleEditNote = (note) => {
    setEditingNote(note)
    setShowForm(true)
  }

  const handleSaveNote = async (noteData) => {
    try {
      if (editingNote) {
        await updateNote(editingNote.id, noteData)
      } else {
        await addNote(noteData)
      }
      setShowForm(false)
      setEditingNote(null)
    } catch (error) {
      console.error('Erro ao salvar anotação:', error)
    }
  }

  const handleDeleteNote = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      try {
        await deleteNote(id)
      } catch (error) {
        console.error('Erro ao excluir anotação:', error)
      }
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingNote(null)
  }

  const handleImportClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        handleImportNotes(file)
      }
    }
    input.click()
  }

  const handleImportNotes = async (file) => {
    try {
      const result = await importNotes(file)
      setImportResult({
        type: 'success',
        message: `Importação concluída! ${result.imported} novas anotações, ${result.updated} atualizadas, ${result.skipped} ignoradas.`
      })
      
      // Limpar mensagem após 5 segundos
      setTimeout(() => setImportResult(null), 5000)
    } catch (error) {
      setImportResult({
        type: 'error', 
        message: `Erro na importação: ${error.message}`
      })
      
      // Limpar mensagem após 5 segundos
      setTimeout(() => setImportResult(null), 5000)
    }
  }

  return (
    <div className="app">
      <Header 
        onAddNote={handleAddNote}
        totalNotes={notes.length}
        onExportNotes={exportNotesDB}
        onImportNotes={handleImportNotes}
        onSyncConfig={() => setShowSyncConfig(true)}
      />
      
      <main className="main-content">
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchType={searchType}
          onSearchTypeChange={setSearchType}
        />

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {importResult && (
          <div className={`import-message ${importResult.type === 'success' ? 'import-success' : 'import-error'}`}>
            {importResult.type === 'success' ? '✅' : '❌'} {importResult.message}
          </div>
        )}

        <div className="notes-container">
          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? (
                <div>
                  <h3>🔍 Nenhuma anotação encontrada</h3>
                  <p>Tente ajustar sua busca ou criar uma nova anotação.</p>
                </div>
              ) : (
                <div>
                  <h3>📝 Nenhuma anotação ainda</h3>
                  <p>Clique em "Nova" para criar sua primeira anotação!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map(note => (
                <NoteItem
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <NoteForm
          note={editingNote}
          onSave={handleSaveNote}
          onCancel={handleCancelForm}
          isEditing={!!editingNote}
        />
      )}

      {showSyncConfig && (
        <SyncConfigModal
          isOpen={showSyncConfig}
          onClose={() => setShowSyncConfig(false)}
          notes={notes}
          importNotes={handleImportNotes}
          exportNotes={exportNotesDB}
        />
      )}
    </div>
  )
}

export default App