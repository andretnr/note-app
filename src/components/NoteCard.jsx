import React, { useState } from 'react'

const NoteCard = ({ note, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editSubject, setEditSubject] = useState(note.subject)
  const [editContent, setEditContent] = useState(note.content)
  const [editCategory, setEditCategory] = useState(note.category || 'geral')

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryIcon = (category) => {
    const categories = {
      'geral': '📋',
      'trabalho': '💼',
      'pessoal': '👤',
      'estudo': '📚',
      'ideias': '💡',
      'tarefas': '✅',
      'compras': '🛒',
      'viagem': '✈️'
    }
    return categories[category] || '📋'
  }

  const getCategoryName = (category) => {
    const categories = {
      'geral': 'Geral',
      'trabalho': 'Trabalho',
      'pessoal': 'Pessoal',
      'estudo': 'Estudo',
      'ideias': 'Ideias',
      'tarefas': 'Tarefas',
      'compras': 'Compras',
      'viagem': 'Viagem'
    }
    return categories[category] || 'Geral'
  }

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      onDelete(note.id)
    }
  }

  const handleEdit = () => {
    if (isEditing) {
      if (editSubject.trim() && editContent.trim()) {
        onEdit(note.id, {
          subject: editSubject.trim(),
          content: editContent.trim(),
          category: editCategory
        })
        setIsEditing(false)
      }
    } else {
      setIsEditing(true)
    }
  }

  const handleCancel = () => {
    setEditSubject(note.subject)
    setEditContent(note.content)
    setEditCategory(note.category || 'geral')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="note-card editing">
        <div className="note-header">
          <input
            type="text"
            value={editSubject}
            onChange={(e) => setEditSubject(e.target.value)}
            className="edit-subject-input"
            autoFocus
          />
          <div className="edit-actions">
            <button 
              className="save-btn"
              onClick={handleEdit}
              title="Salvar alterações"
            >
              ✅
            </button>
            <button 
              className="cancel-btn"
              onClick={handleCancel}
              title="Cancelar edição"
            >
              ❌
            </button>
          </div>
        </div>
        
        <div className="note-content">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="edit-content-textarea"
            rows="4"
          />
        </div>
        
        <div className="note-footer">
          <span className="note-category">
            {getCategoryIcon(editCategory)}
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="edit-category-select"
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
          </span>
          <span className="note-date">
            📅 {formatDate(note.createdAt)}
            {note.updatedAt && <span className="updated-indicator"> • Editado</span>}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="note-card">
      <div className="note-header">
        <h3 className="note-subject">{note.subject}</h3>
        <div className="note-actions">
          <button 
            className="edit-btn"
            onClick={handleEdit}
            title="Editar anotação"
          >
            ✏️
          </button>
          <button 
            className="delete-btn"
            onClick={handleDelete}
            title="Excluir anotação"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <div className="note-content">
        <p>{note.content}</p>
      </div>
      
      <div className="note-footer">
        <span className="note-category">
          {getCategoryIcon(note.category)} {getCategoryName(note.category)}
        </span>
        <span className="note-date">
          📅 {formatDate(note.createdAt)}
          {note.updatedAt && <span className="updated-indicator"> • Editado</span>}
        </span>
      </div>
    </div>
  )
}

export default NoteCard