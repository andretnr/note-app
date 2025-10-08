import { useState, useEffect, useCallback, useRef } from 'react'

// Wrapper IndexedDB com API simples e robusta
class NotesDB {
  constructor() {
    this.dbName = 'NotesAppDB'
    this.version = 1
    this.storeName = 'notes'
    this.db = null
    this.isReady = false
    this.syncKey = 'notes_sync_timestamp'
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => {
        console.error('Erro ao abrir IndexedDB:', request.error)
        reject(request.error)
      }
      
      request.onsuccess = () => {
        this.db = request.result
        this.isReady = true
        console.log('✅ IndexedDB inicializado com sucesso')
        resolve(this.db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Criar object store para anotações
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          
          // Criar índices para busca avançada
          store.createIndex('subject', 'subject', { unique: false })
          store.createIndex('category', 'category', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('updatedAt', 'updatedAt', { unique: false })
          store.createIndex('content', 'content', { unique: false })
          
          console.log('📋 Object store e índices criados')
        }
      }
    })
  }

  async getAllNotes() {
    if (!this.isReady) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()
      
      request.onsuccess = () => {
        const notes = request.result || []
        // Ordenar por data de criação (mais recente primeiro)
        notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        resolve(notes)
      }
      
      request.onerror = () => {
        console.error('Erro ao buscar anotações:', request.error)
        reject(request.error)
      }
    })
  }

  async saveNote(note) {
    if (!this.isReady) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      // Adicionar timestamp de atualização
      const noteWithTimestamp = {
        ...note,
        lastModified: new Date().toISOString()
      }
      
      const request = store.put(noteWithTimestamp)
      
      request.onsuccess = () => {
        this.updateSyncTimestamp()
        resolve(noteWithTimestamp)
      }
      
      request.onerror = () => {
        console.error('Erro ao salvar anotação:', request.error)
        reject(request.error)
      }
    })
  }

  async deleteNote(id) {
    if (!this.isReady) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)
      
      request.onsuccess = () => {
        this.updateSyncTimestamp()
        resolve(true)
      }
      
      request.onerror = () => {
        console.error('Erro ao deletar anotação:', request.error)
        reject(request.error)
      }
    })
  }

  async searchNotes(searchTerm, searchType = 'subject') {
    if (!this.isReady) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      
      let request
      
      if (searchType === 'subject') {
        // Busca por assunto usando índice
        const index = store.index('subject')
        request = index.getAll()
      } else if (searchType === 'category') {
        // Busca por categoria usando índice
        const index = store.index('category')
        request = index.getAll(searchTerm)
      } else {
        // Busca geral
        request = store.getAll()
      }
      
      request.onsuccess = () => {
        let results = request.result || []
        
        // Filtrar resultados baseado no termo de busca
        if (searchTerm) {
          results = results.filter(note => {
            switch (searchType) {
              case 'subject':
                return note.subject.toLowerCase().includes(searchTerm.toLowerCase())
              case 'content':
                return note.content.toLowerCase().includes(searchTerm.toLowerCase())
              case 'date':
                const noteDate = new Date(note.createdAt).toLocaleDateString('pt-BR')
                return noteDate.includes(searchTerm)
              default:
                return true
            }
          })
        }
        
        // Ordenar resultados
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        resolve(results)
      }
      
      request.onerror = () => {
        console.error('Erro na busca:', request.error)
        reject(request.error)
      }
    })
  }

  async exportNotes() {
    try {
      const notes = await this.getAllNotes()
      const exportData = {
        notes,
        timestamp: new Date().toISOString(),
        version: '2.0',
        source: 'indexeddb',
        totalNotes: notes.length
      }
      return exportData
    } catch (error) {
      console.error('Erro ao exportar:', error)
      throw error
    }
  }

  async importNotes(importData, mergeStrategy = 'smart') {
    if (!importData.notes || !Array.isArray(importData.notes)) {
      throw new Error('Dados de importação inválidos')
    }

    try {
      const existingNotes = await this.getAllNotes()
      const existingIds = new Set(existingNotes.map(note => note.id))
      
      let imported = 0
      let updated = 0
      let skipped = 0

      for (const importNote of importData.notes) {
        if (existingIds.has(importNote.id)) {
          if (mergeStrategy === 'smart') {
            // Comparar timestamps e manter o mais recente
            const existing = existingNotes.find(n => n.id === importNote.id)
            const existingTime = new Date(existing.lastModified || existing.updatedAt || existing.createdAt)
            const importTime = new Date(importNote.lastModified || importNote.updatedAt || importNote.createdAt)
            
            if (importTime > existingTime) {
              await this.saveNote(importNote)
              updated++
            } else {
              skipped++
            }
          }
        } else {
          await this.saveNote(importNote)
          imported++
        }
      }

      return { imported, updated, skipped, total: importData.notes.length }
    } catch (error) {
      console.error('Erro ao importar:', error)
      throw error
    }
  }

  updateSyncTimestamp() {
    localStorage.setItem(this.syncKey, new Date().toISOString())
  }

  getSyncTimestamp() {
    return localStorage.getItem(this.syncKey)
  }

  async clearAll() {
    if (!this.isReady) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()
      
      request.onsuccess = () => {
        this.updateSyncTimestamp()
        console.log('🗑️ Todas as anotações foram removidas')
        resolve(true)
      }
      
      request.onerror = () => {
        console.error('Erro ao limpar banco:', request.error)
        reject(request.error)
      }
    })
  }
}

// Hook React para IndexedDB
export const useIndexedDB = () => {
  const [notes, setNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [syncStatus, setSyncStatus] = useState('idle') // idle, syncing, success, error
  const [lastSync, setLastSync] = useState(null)
  
  const dbRef = useRef(null)

  // Inicializar IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        dbRef.current = new NotesDB()
        await dbRef.current.init()
        
        const allNotes = await dbRef.current.getAllNotes()
        setNotes(allNotes)
        setLastSync(dbRef.current.getSyncTimestamp())
        setIsLoading(false)
        
        console.log(`📋 Carregadas ${allNotes.length} anotações do IndexedDB`)
      } catch (err) {
        console.error('Erro ao inicializar IndexedDB:', err)
        setError(err.message)
        setIsLoading(false)
      }
    }

    initDB()
  }, [])

  // Adicionar nova anotação
  const addNote = useCallback(async (noteData) => {
    if (!dbRef.current) return

    try {
      setSyncStatus('syncing')
      
      // Garantir que o ID seja válido (apenas para novas notas)
      const newNote = {
        ...noteData,
        id: Date.now(), // Sempre gerar novo ID para novas notas
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }

      const savedNote = await dbRef.current.saveNote(newNote)
      setNotes(prev => [savedNote, ...prev])
      setLastSync(new Date().toISOString())
      setSyncStatus('success')
      
      // Resetar status após 2 segundos
      setTimeout(() => setSyncStatus('idle'), 2000)
      
      return savedNote
    } catch (err) {
      console.error('Erro ao adicionar anotação:', err)
      setError(err.message)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
      throw err
    }
  }, [])

  // Atualizar anotação
  const updateNote = useCallback(async (id, updates) => {
    if (!dbRef.current) return

    try {
      setSyncStatus('syncing')
      
      // Verificar se o ID é válido
      if (!id || (typeof id !== 'number' && typeof id !== 'string')) {
        throw new Error('ID da anotação inválido')
      }
      
      const existingNote = notes.find(note => note.id === id)
      if (!existingNote) {
        throw new Error('Anotação não encontrada')
      }

      const updatedNote = {
        ...existingNote,
        ...updates,
        id: existingNote.id, // Preservar o ID original
        updatedAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }

      const savedNote = await dbRef.current.saveNote(updatedNote)
      setNotes(prev => prev.map(note => note.id === id ? savedNote : note))
      setLastSync(new Date().toISOString())
      setSyncStatus('success')
      
      setTimeout(() => setSyncStatus('idle'), 2000)
      
      return savedNote
    } catch (err) {
      console.error('Erro ao atualizar anotação:', err)
      setError(err.message)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
      throw err
    }
  }, [notes])

  // Deletar anotação
  const deleteNote = useCallback(async (id) => {
    if (!dbRef.current) return

    try {
      setSyncStatus('syncing')
      
      await dbRef.current.deleteNote(id)
      setNotes(prev => prev.filter(note => note.id !== id))
      setLastSync(new Date().toISOString())
      setSyncStatus('success')
      
      setTimeout(() => setSyncStatus('idle'), 2000)
      
      return true
    } catch (err) {
      console.error('Erro ao deletar anotação:', err)
      setError(err.message)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
      throw err
    }
  }, [])

  // Buscar anotações
  const searchNotes = useCallback(async (searchTerm, searchType = 'subject') => {
    if (!dbRef.current) return []

    try {
      const results = await dbRef.current.searchNotes(searchTerm, searchType)
      return results
    } catch (err) {
      console.error('Erro na busca:', err)
      setError(err.message)
      return []
    }
  }, [])

  // Exportar anotações
  const exportNotes = useCallback(async () => {
    if (!dbRef.current) return

    try {
      const exportData = await dbRef.current.exportNotes()
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
      const exportFileDefaultName = `anotacoes_indexeddb_backup_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      console.log(`📤 Exportadas ${exportData.totalNotes} anotações`)
      return exportData
    } catch (err) {
      console.error('Erro ao exportar:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // Importar anotações
  const importNotes = useCallback(async (file) => {
    if (!dbRef.current || !file) return

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          setSyncStatus('syncing')
          
          const importData = JSON.parse(e.target.result)
          const result = await dbRef.current.importNotes(importData, 'smart')
          
          // Recarregar anotações após importação
          const allNotes = await dbRef.current.getAllNotes()
          setNotes(allNotes)
          setLastSync(new Date().toISOString())
          setSyncStatus('success')
          
          setTimeout(() => setSyncStatus('idle'), 2000)
          
          console.log(`📥 Importação concluída:`, result)
          resolve(result)
        } catch (error) {
          console.error('Erro ao importar:', error)
          setError(error.message)
          setSyncStatus('error')
          setTimeout(() => setSyncStatus('idle'), 3000)
          reject(error)
        }
      }
      
      reader.onerror = () => {
        const error = new Error('Erro ao ler arquivo')
        setError(error.message)
        setSyncStatus('error')
        setTimeout(() => setSyncStatus('idle'), 3000)
        reject(error)
      }
      
      reader.readAsText(file)
    })
  }, [])

  // Sincronização manual
  const manualSync = useCallback(async () => {
    if (!dbRef.current) return

    try {
      setSyncStatus('syncing')
      
      // Recarregar dados do IndexedDB
      const allNotes = await dbRef.current.getAllNotes()
      setNotes(allNotes)
      setLastSync(new Date().toISOString())
      setSyncStatus('success')
      
      setTimeout(() => setSyncStatus('idle'), 2000)
      
      return allNotes
    } catch (err) {
      console.error('Erro na sincronização manual:', err)
      setError(err.message)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
      throw err
    }
  }, [])

  return {
    // Dados
    notes,
    isLoading,
    error,
    syncStatus,
    lastSync,
    
    // Métodos CRUD
    addNote,
    updateNote,
    deleteNote,
    searchNotes,
    
    // Sincronização
    exportNotes,
    importNotes,
    manualSync,
    
    // Utilitários
    clearError: () => setError(null),
    totalNotes: notes.length
  }
}

export default useIndexedDB