import React from 'react'

const NoteItem = ({ note, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="note-item">
      <div className="note-header">
        <h3 className="note-subject">{note.subject}</h3>
        <div className="note-actions">
          <button onClick={() => onEdit(note)} className="btn btn-small">
            ✏️ Editar
          </button>
          <button onClick={() => onDelete(note.id)} className="btn btn-small btn-danger">
            🗑️ Excluir
          </button>
        </div>
      </div>
      <p className="note-content">{note.content}</p>
      <div className="note-footer">
        <small className="note-date">
          Criado: {formatDate(note.createdAt)}
          {note.updatedAt && note.updatedAt !== note.createdAt && (
            <span> • Editado: {formatDate(note.updatedAt)}</span>
          )}
        </small>
      </div>
    </div>
  )
}

export default NoteItem