import React, { useState } from 'react'

const NoteForm = ({ onSubmit, onCancel }) => {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('geral')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (subject.trim() && content.trim()) {
      onSubmit({
        subject: subject.trim(),
        content: content.trim(),
        category: category
      })
      setSubject('')
      setContent('')
      setCategory('geral')
    }
  }

  return (
    <div className="note-form-container">
      <form onSubmit={handleSubmit} className="note-form">
        <h3>Nova Anotação</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subject">Assunto:</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Digite o assunto da anotação"
              required
              className="form-input"
            />
          </div>

          <div className="form-group form-group-small">
            <label htmlFor="category">Categoria:</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              <option value="geral">📋 Geral</option>
              <option value="trabalho">💼 Trabalho</option>
              <option value="pessoal">👤 Pessoal</option>
              <option value="estudo">📚 Estudo</option>
              <option value="ideias">💡 Ideias</option>
              <option value="tarefas">✅ Tarefas</option>
              <option value="compras">🛒 Compras</option>
              <option value="viagem">✈️ Viagem</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="content">Conteúdo:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Digite o conteúdo da anotação"
            required
            rows="6"
            className="form-textarea"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Salvar
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default NoteForm