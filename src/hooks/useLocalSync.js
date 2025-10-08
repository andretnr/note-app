import { useState, useEffect, useCallback, useRef } from 'react'

// Sistema de sincronização local via arquivos compartilhados
class LocalSyncManager {
  constructor() {
    this.syncFileName = 'anotacoes_sync_local.json'
    this.syncKey = 'local_sync_enabled'
    this.lastSyncKey = 'last_local_sync'
    this.conflictResolutionKey = 'conflict_resolution_strategy'
    
    // Estratégias de resolução de conflito
    this.conflictStrategies = {
      NEWEST_WINS: 'newest_wins',
      MANUAL: 'manual',
      MERGE_ALL: 'merge_all'
    }
    
    this.syncInterval = null
    this.isMonitoring = false
  }

  // Verificar se a sincronização local está habilitada
  isSyncEnabled() {
    return localStorage.getItem(this.syncKey) === 'true'
  }

  // Habilitar/desabilitar sincronização local
  setSyncEnabled(enabled) {
    localStorage.setItem(this.syncKey, enabled.toString())
    
    if (enabled && !this.isMonitoring) {
      this.startMonitoring()
    } else if (!enabled && this.isMonitoring) {
      this.stopMonitoring()
    }
  }

  // Obter estratégia de resolução de conflito
  getConflictStrategy() {
    return localStorage.getItem(this.conflictResolutionKey) || this.conflictStrategies.NEWEST_WINS
  }

  // Definir estratégia de resolução de conflito
  setConflictStrategy(strategy) {
    localStorage.setItem(this.conflictResolutionKey, strategy)
  }

  // Criar arquivo de sincronização
  async createSyncFile(notes) {
    try {
      const syncData = {
        notes: notes || [],
        timestamp: new Date().toISOString(),
        version: '2.0',
        source: 'local_sync',
        deviceId: this.getDeviceId(),
        totalNotes: (notes || []).length,
        checksum: this.generateChecksum(notes || [])
      }

      const dataStr = JSON.stringify(syncData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      
      // Criar link temporário para download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = this.syncFileName
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      // Atualizar timestamp do último sync
      localStorage.setItem(this.lastSyncKey, syncData.timestamp)
      
      console.log(`🔄 Arquivo de sync criado: ${this.syncFileName}`)
      return syncData
      
    } catch (error) {
      console.error('Erro ao criar arquivo de sync:', error)
      throw error
    }
  }

  // Ler arquivo de sincronização (via input file)
  async readSyncFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Nenhum arquivo selecionado'))
        return
      }

      if (!file.name.includes('sync') && !file.name.includes('backup')) {
        console.warn('⚠️ Arquivo pode não ser um arquivo de sincronização válido')
      }

      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const syncData = JSON.parse(e.target.result)
          
          // Validar estrutura do arquivo
          if (!syncData.notes || !Array.isArray(syncData.notes)) {
            reject(new Error('Formato de arquivo inválido: propriedade "notes" não encontrada'))
            return
          }

          // Validar checksum se disponível
          if (syncData.checksum) {
            const calculatedChecksum = this.generateChecksum(syncData.notes)
            if (calculatedChecksum !== syncData.checksum) {
              console.warn('⚠️ Checksum não confere - arquivo pode estar corrompido')
            }
          }

          console.log(`📥 Arquivo de sync lido: ${syncData.totalNotes} anotações`)
          resolve(syncData)
          
        } catch (error) {
          reject(new Error(`Erro ao analisar arquivo: ${error.message}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'))
      }
      
      reader.readAsText(file)
    })
  }

  // Detectar conflitos entre dados locais e arquivo de sync
  detectConflicts(localNotes, syncNotes) {
    const conflicts = []
    const localNotesMap = new Map(localNotes.map(note => [note.id, note]))
    
    for (const syncNote of syncNotes) {
      const localNote = localNotesMap.get(syncNote.id)
      
      if (localNote) {
        // Comparar timestamps para detectar conflito
        const localTime = new Date(localNote.lastModified || localNote.updatedAt || localNote.createdAt)
        const syncTime = new Date(syncNote.lastModified || syncNote.updatedAt || syncNote.createdAt)
        
        // Se as datas são diferentes, pode haver conflito
        if (Math.abs(localTime - syncTime) > 1000) { // Diferença > 1 segundo
          conflicts.push({
            id: syncNote.id,
            type: 'modified',
            local: localNote,
            sync: syncNote,
            localTime,
            syncTime
          })
        }
      }
    }
    
    return conflicts
  }

  // Resolver conflitos baseado na estratégia escolhida
  resolveConflicts(localNotes, syncNotes, strategy = null) {
    const resolveStrategy = strategy || this.getConflictStrategy()
    const conflicts = this.detectConflicts(localNotes, syncNotes)
    
    console.log(`🔧 Resolvendo ${conflicts.length} conflitos com estratégia: ${resolveStrategy}`)
    
    let mergedNotes = [...localNotes]
    const localNotesMap = new Map(localNotes.map(note => [note.id, note]))
    
    switch (resolveStrategy) {
      case this.conflictStrategies.NEWEST_WINS:
        // A versão mais recente sempre vence
        for (const syncNote of syncNotes) {
          const localNote = localNotesMap.get(syncNote.id)
          
          if (!localNote) {
            // Nota não existe localmente, adicionar
            mergedNotes.push(syncNote)
          } else {
            // Comparar timestamps e manter o mais recente
            const localTime = new Date(localNote.lastModified || localNote.updatedAt || localNote.createdAt)
            const syncTime = new Date(syncNote.lastModified || syncNote.updatedAt || syncNote.createdAt)
            
            if (syncTime > localTime) {
              // Versão do sync é mais recente, substituir
              const index = mergedNotes.findIndex(n => n.id === syncNote.id)
              if (index !== -1) {
                mergedNotes[index] = syncNote
              }
            }
          }
        }
        break
        
      case this.conflictStrategies.MERGE_ALL:
        // Adicionar todas as notas do sync que não existem localmente
        for (const syncNote of syncNotes) {
          if (!localNotesMap.has(syncNote.id)) {
            mergedNotes.push(syncNote)
          }
        }
        break
        
      case this.conflictStrategies.MANUAL:
        // Retornar conflitos para resolução manual
        return {
          mergedNotes: localNotes, // Manter dados locais
          conflicts,
          requiresManualResolution: true
        }
    }
    
    // Ordenar por data de criação
    mergedNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    return {
      mergedNotes,
      conflicts,
      requiresManualResolution: false,
      stats: {
        total: mergedNotes.length,
        added: mergedNotes.length - localNotes.length,
        conflicts: conflicts.length,
        strategy: resolveStrategy
      }
    }
  }

  // Gerar checksum simples para validação de integridade
  generateChecksum(notes) {
    const dataString = JSON.stringify(notes.map(n => ({ id: n.id, subject: n.subject, lastModified: n.lastModified })))
    let hash = 0
    
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Converter para 32bit
    }
    
    return hash.toString(36)
  }

  // Obter ID único do dispositivo/navegador
  getDeviceId() {
    let deviceId = localStorage.getItem('device_id')
    
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('device_id', deviceId)
    }
    
    return deviceId
  }

  // Obter informações do último sync
  getLastSyncInfo() {
    const lastSync = localStorage.getItem(this.lastSyncKey)
    return lastSync ? {
      timestamp: lastSync,
      date: new Date(lastSync),
      ago: this.getTimeAgo(new Date(lastSync))
    } : null
  }

  // Calcular tempo decorrido desde uma data
  getTimeAgo(date) {
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes === 1) return 'Há 1 minuto'
    if (diffInMinutes < 60) return `Há ${diffInMinutes} minutos`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours === 1) return 'Há 1 hora'
    if (diffInHours < 24) return `Há ${diffInHours} horas`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Há 1 dia'
    if (diffInDays < 30) return `Há ${diffInDays} dias`
    
    return date.toLocaleDateString('pt-BR')
  }

  // Iniciar monitoramento automático (futuro)
  startMonitoring() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    console.log('🔄 Monitoramento de sincronização iniciado')
    
    // Placeholder para implementação futura de monitoramento automático
    // Pode incluir verificação periódica de arquivos na pasta Downloads
  }

  // Parar monitoramento
  stopMonitoring() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    
    this.isMonitoring = false
    console.log('🛑 Monitoramento de sincronização parado')
  }
}

// Hook React para sincronização local
export const useLocalSync = (notesData = [], onSyncComplete = null) => {
  const [syncManager] = useState(() => new LocalSyncManager())
  const [syncStatus, setSyncStatus] = useState('idle') // idle, creating, reading, syncing, success, error
  const [syncError, setSyncError] = useState(null)
  const [conflicts, setConflicts] = useState([])
  const [lastSyncInfo, setLastSyncInfo] = useState(null)
  const [syncEnabled, setSyncEnabledState] = useState(false)
  
  const fileInputRef = useRef(null)

  // Inicializar configurações
  useEffect(() => {
    const enabled = syncManager.isSyncEnabled()
    setSyncEnabledState(enabled)
    setLastSyncInfo(syncManager.getLastSyncInfo())
  }, [syncManager])

  // Criar arquivo de sincronização
  const createSync = useCallback(async () => {
    try {
      setSyncStatus('creating')
      setSyncError(null)
      
      const syncData = await syncManager.createSyncFile(notesData)
      setLastSyncInfo(syncManager.getLastSyncInfo())
      setSyncStatus('success')
      
      if (onSyncComplete) {
        onSyncComplete({ type: 'create', data: syncData })
      }
      
      setTimeout(() => setSyncStatus('idle'), 2000)
      return syncData
      
    } catch (error) {
      console.error('Erro ao criar sync:', error)
      setSyncError(error.message)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
      throw error
    }
  }, [notesData, syncManager, onSyncComplete])

  // Ler arquivo de sincronização
  const readSync = useCallback(async (file) => {
    try {
      setSyncStatus('reading')
      setSyncError(null)
      
      const syncData = await syncManager.readSyncFile(file)
      setSyncStatus('success')
      
      setTimeout(() => setSyncStatus('idle'), 2000)
      return syncData
      
    } catch (error) {
      console.error('Erro ao ler sync:', error)
      setSyncError(error.message)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
      throw error
    }
  }, [syncManager])

  // Sincronizar dados (merge)
  const syncData = useCallback(async (syncNotes, strategy = null) => {
    try {
      setSyncStatus('syncing')
      setSyncError(null)
      
      const result = syncManager.resolveConflicts(notesData, syncNotes, strategy)
      
      if (result.requiresManualResolution) {
        setConflicts(result.conflicts)
        setSyncStatus('conflicts')
        return result
      }
      
      setSyncStatus('success')
      setConflicts([])
      
      if (onSyncComplete) {
        onSyncComplete({ type: 'sync', data: result.mergedNotes, stats: result.stats })
      }
      
      setTimeout(() => setSyncStatus('idle'), 2000)
      return result
      
    } catch (error) {
      console.error('Erro ao sincronizar:', error)
      setSyncError(error.message)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
      throw error
    }
  }, [notesData, syncManager, onSyncComplete])

  // Resolver conflito manual
  const resolveConflict = useCallback((conflictId, chosenVersion) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId))
    
    // Se não há mais conflitos, finalizar sincronização
    const remainingConflicts = conflicts.filter(c => c.id !== conflictId)
    if (remainingConflicts.length === 0) {
      setSyncStatus('success')
      setTimeout(() => setSyncStatus('idle'), 2000)
    }
  }, [conflicts])

  // Habilitar/desabilitar sincronização
  const toggleSync = useCallback((enabled) => {
    syncManager.setSyncEnabled(enabled)
    setSyncEnabledState(enabled)
  }, [syncManager])

  // Configurar estratégia de conflito
  const setConflictStrategy = useCallback((strategy) => {
    syncManager.setConflictStrategy(strategy)
  }, [syncManager])

  // Trigger para seleção de arquivo
  const triggerFileSelect = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  // Limpar erro
  const clearError = useCallback(() => {
    setSyncError(null)
  }, [])

  return {
    // Estado
    syncStatus,
    syncError,
    conflicts,
    lastSyncInfo,
    syncEnabled,
    
    // Métodos principais
    createSync,
    readSync,
    syncData,
    resolveConflict,
    
    // Configuração
    toggleSync,
    setConflictStrategy,
    getConflictStrategy: syncManager.getConflictStrategy.bind(syncManager),
    
    // Utilitários
    triggerFileSelect,
    clearError,
    fileInputRef,
    
    // Constantes
    conflictStrategies: syncManager.conflictStrategies
  }
}

export default useLocalSync