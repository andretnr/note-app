import React, { useState } from 'react'

const SyncManager = ({ 
  syncStatus, 
  syncError, 
  lastSyncInfo, 
  syncEnabled,
  conflicts,
  onCreateSync,
  onReadSync,
  onToggleSync,
  onTriggerFileSelect,
  onResolveConflict,
  onClearError,
  fileInputRef,
  conflictStrategies,
  onSetConflictStrategy,
  getConflictStrategy
}) => {
  const [showSettings, setShowSettings] = useState(false)
  const [showConflicts, setShowConflicts] = useState(false)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      onReadSync(file)
    }
  }

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'creating': return '📤'
      case 'reading': return '📥'
      case 'syncing': return '🔄'
      case 'success': return '✅'
      case 'error': return '❌'
      case 'conflicts': return '⚠️'
      default: return '💾'
    }
  }

  const getStatusText = () => {
    switch (syncStatus) {
      case 'creating': return 'Criando arquivo de sync...'
      case 'reading': return 'Lendo arquivo de sync...'
      case 'syncing': return 'Sincronizando dados...'
      case 'success': return 'Sincronização concluída'
      case 'error': return 'Erro na sincronização'
      case 'conflicts': return 'Conflitos detectados'
      default: return 'Pronto para sincronizar'
    }
  }

  const formatLastSync = () => {
    if (!lastSyncInfo) return 'Nunca'
    return lastSyncInfo.ago
  }

  return (
    <div className="sync-manager">
      {/* Status Principal */}
      <div className="sync-status-bar">
        <div className="sync-status-info">
          <span className="sync-status-icon">{getStatusIcon()}</span>
          <div className="sync-status-text">
            <span className="sync-status-main">{getStatusText()}</span>
            <span className="sync-status-sub">
              {syncEnabled ? `Último sync: ${formatLastSync()}` : 'Sincronização desabilitada'}
            </span>
          </div>
        </div>
        
        <div className="sync-actions">
          {syncEnabled && syncStatus !== 'creating' && syncStatus !== 'reading' && syncStatus !== 'syncing' && (
            <button 
              className="sync-btn sync-btn-create"
              onClick={onCreateSync}
              title="Criar arquivo de sincronização"
            >
              📤 Criar Sync
            </button>
          )}
          
          {syncEnabled && syncStatus !== 'creating' && syncStatus !== 'reading' && syncStatus !== 'syncing' && (
            <button 
              className="sync-btn sync-btn-read"
              onClick={onTriggerFileSelect}
              title="Ler arquivo de sincronização"
            >
              📥 Ler Sync
            </button>
          )}
          
          <button 
            className="sync-btn sync-btn-settings"
            onClick={() => setShowSettings(!showSettings)}
            title="Configurações de sincronização"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Input de arquivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* Alerta de Conflitos */}
      {conflicts.length > 0 && (
        <div className="sync-conflicts-alert">
          <div className="conflict-header">
            <span>⚠️ {conflicts.length} conflito(s) detectado(s)</span>
            <button 
              className="conflict-btn"
              onClick={() => setShowConflicts(!showConflicts)}
            >
              {showConflicts ? 'Ocultar' : 'Resolver'}
            </button>
          </div>
          
          {showConflicts && (
            <div className="conflicts-list">
              {conflicts.map((conflict) => (
                <div key={conflict.id} className="conflict-item">
                  <div className="conflict-info">
                    <h4>{conflict.local.subject || 'Anotação sem título'}</h4>
                    <p>Conflito: versão local vs. versão do arquivo</p>
                    <div className="conflict-times">
                      <span>Local: {new Date(conflict.localTime).toLocaleString('pt-BR')}</span>
                      <span>Arquivo: {new Date(conflict.syncTime).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="conflict-actions">
                    <button 
                      className="conflict-resolve-btn conflict-local"
                      onClick={() => onResolveConflict(conflict.id, 'local')}
                    >
                      Usar Local
                    </button>
                    <button 
                      className="conflict-resolve-btn conflict-sync"
                      onClick={() => onResolveConflict(conflict.id, 'sync')}
                    >
                      Usar Arquivo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Erro */}
      {syncError && (
        <div className="sync-error">
          <span>❌ {syncError}</span>
          <button onClick={onClearError}>✕</button>
        </div>
      )}

      {/* Configurações */}
      {showSettings && (
        <div className="sync-settings">
          <div className="sync-setting-item">
            <label>
              <input
                type="checkbox"
                checked={syncEnabled}
                onChange={(e) => onToggleSync(e.target.checked)}
              />
              Habilitar sincronização local
            </label>
          </div>
          
          <div className="sync-setting-item">
            <label>Resolução de conflitos:</label>
            <select 
              value={getConflictStrategy()}
              onChange={(e) => onSetConflictStrategy(e.target.value)}
            >
              <option value={conflictStrategies.NEWEST_WINS}>
                Mais recente vence
              </option>
              <option value={conflictStrategies.MANUAL}>
                Resolução manual
              </option>
              <option value={conflictStrategies.MERGE_ALL}>
                Mesclar tudo
              </option>
            </select>
          </div>
          
          <div className="sync-setting-info">
            <h4>Como funciona a sincronização local:</h4>
            <ul>
              <li><strong>Criar Sync:</strong> Salva suas anotações em um arquivo JSON</li>
              <li><strong>Ler Sync:</strong> Importa anotações de um arquivo de sincronização</li>
              <li><strong>Resolução de conflitos:</strong> Define como tratar anotações duplicadas</li>
              <li><strong>Arquivo gerado:</strong> anotacoes_sync_local.json</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default SyncManager