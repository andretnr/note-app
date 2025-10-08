import React, { useState, useEffect } from 'react'
import './styles/App.css'
import useIndexedDB from './hooks/useIndexedDB'
import useLocalSync from './hooks/useLocalSync'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import NoteForm from './components/NoteForm'
import NoteItem from './components/NoteItem'
import SyncManager from './components/SyncManager'

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

  const {
    isEnabled: syncEnabled,
    lastSync,
    conflicts,
    sync: manualSync,
    toggleSync,
    resolveConflict
  } = useLocalSync(notes, { addNote, updateNote, deleteNote })

  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState('subject')
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [showSyncManager, setShowSyncManager] = useState(false)

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
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        manualSync()
      }
      if (e.key === 'Escape' && showForm) {
        setShowForm(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showForm, exportNotesDB, manualSync])

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

  const handleToggleSync = () => {
    setShowSyncManager(!showSyncManager)
  }

  return (
    <div className="app">
      <Header 
        onAddNote={handleAddNote}
        totalNotes={notes.length}
        onExportNotes={exportNotesDB}
        onToggleSync={handleToggleSync}
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

        {showSyncManager && (
          <SyncManager 
            isEnabled={syncEnabled}
            lastSync={lastSync}
            conflicts={conflicts}
            onToggleSync={toggleSync}
            onManualSync={manualSync}
            onResolveConflict={resolveConflict}
            onClose={() => setShowSyncManager(false)}
          />
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
    </div>
  )
}

export default App