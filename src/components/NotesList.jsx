import React from 'react'
import NoteCard from './NoteCard'

const NotesList = ({ notes, onDelete, onEdit }) => {
  if (notes.length === 0) {
    return (
      <div className="empty-state">
        <p>Nenhuma anotação encontrada.</p>
        <p>Crie sua primeira anotação clicando em "Nova Anotação"!</p>
      </div>
    )
  }

  return (
    <div className="notes-list">
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}

export default NotesList