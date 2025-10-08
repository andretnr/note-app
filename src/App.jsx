import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import NoteForm from './components/NoteForm'
import NotesList from './components/NotesList'
import useLocalStorage from './hooks/useLocalStorage'
import './styles/App.css'

function App() {
  // Usar hook customizado para localStorage confiável
  const [notes, setNotes] = useLocalStorage('notes', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState('subject')
  const [showForm, setShowForm] = useState(false)

  const addNote = (note) => {
    const newNote = {
      id: Date.now(),
      ...note,
      createdAt: new Date().toISOString()
    }
    setNotes(prevNotes => [newNote, ...prevNotes])
    setShowForm(false)
  }

  const deleteNote = (id) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id))
  }

  const editNote = (id, updatedNote) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id 
          ? { ...note, ...updatedNote, updatedAt: new Date().toISOString() }
          : note
      )
    )
  }

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + N para nova anotação
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setShowForm(true)
      }
      // Escape para fechar formulário
      if (e.key === 'Escape' && showForm) {
        setShowForm(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showForm])

  // Função para exportar anotações
  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `anotacoes_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const filteredNotes = notes.filter(note => {
    if (!searchTerm) return true
    
    if (searchType === 'subject') {
      return note.subject.toLowerCase().includes(searchTerm.toLowerCase())
    } else if (searchType === 'date') {
      const noteDate = new Date(note.createdAt).toLocaleDateString('pt-BR')
      return noteDate.includes(searchTerm)
    }
    
    return true
  })

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="controls">
          <SearchBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchType={searchType}
            setSearchType={setSearchType}
          />
          <div className="actions-group">
            <div className="stats">
              <span className="stats-item">📝 {notes.length} anotações</span>
              {searchTerm && (
                <span className="stats-item">🔍 {filteredNotes.length} encontradas</span>
              )}
            </div>
            <button 
              className="export-btn"
              onClick={() => exportNotes()}
              title="Exportar anotações"
              disabled={notes.length === 0}
            >
              📤 Exportar
            </button>
            <button 
              className="add-note-btn"
              onClick={() => setShowForm(!showForm)}
              title="Nova anotação (Ctrl+N)"
            >
              {showForm ? '❌ Cancelar' : '+ Nova Anotação'}
            </button>
          </div>
        </div>

        {showForm && (
          <NoteForm 
            onSubmit={addNote} 
            onCancel={() => setShowForm(false)}
          />
        )}

        <NotesList 
          notes={filteredNotes}
          onDelete={deleteNote}
          onEdit={editNote}
        />
      </main>
    </div>
  )
}

export default App