import React, { useState, useEffect } from 'react'

const NoteForm = ({ note, onSave, onCancel, isEditing }) => {
  const [subject, setSubject] = useState(note?.subject || '')
  const [content, setContent] = useState(note?.content || '')
  const [category, setCategory] = useState(note?.category || 'geral')

  // Atualiza os campos quando a nota editada muda
  useEffect(() => {
    if (note) {
      setSubject(note.subject || '')
      setContent(note.content || '')
      setCategory(note.category || 'geral')
    } else {
      setSubject('')
      setContent('')
      setCategory('geral')
    }
  }, [note])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (subject.trim() && content.trim()) {
      const noteData = {
        subject: subject.trim(),
        content: content.trim(),
        category: category,
        updatedAt: new Date().toISOString()
      }

      // Adicionar dados específicos apenas para edição
      if (isEditing && note?.id) {
        noteData.id = note.id
        noteData.createdAt = note.createdAt
      }

      onSave(noteData)
      
      if (!isEditing) {
        setSubject('')
        setContent('')
        setCategory('geral')
      }
    }
  }

  // Fechar modal ao clicar no overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div className="note-form-overlay" onClick={handleOverlayClick}>
      <form onSubmit={handleSubmit} className="note-form" onClick={(e) => e.stopPropagation()}>
        <h3>{isEditing ? 'Editar Anotação' : 'Nova Anotação'}</h3>
        
        <div className="form-group">
          <label htmlFor="subject">Assunto:</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Digite o assunto da anotação"
            autoFocus
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Conteúdo:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Digite o conteúdo da anotação"
            required
            rows={6}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NoteForm