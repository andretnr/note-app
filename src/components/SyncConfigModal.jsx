import React, { useState, useEffect } from 'react'

const SyncConfigModal = ({ isOpen, onClose, notes, importNotes, exportNotes }) => {
  const [activeTab, setActiveTab] = useState('manual')
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false)
  const [syncFile, setSyncFile] = useState(null)
  const [lastAutoSync, setLastAutoSync] = useState(null)

  // Verificar se o File System Access API está disponível
  const isFileSystemAccessSupported = 'showDirectoryPicker' in window

  useEffect(() => {
    if (isOpen) {
      // Carregar configurações salvas
      const savedConfig = localStorage.getItem('autoSyncConfig')
      if (savedConfig) {
        const config = JSON.parse(savedConfig)
        setAutoSyncEnabled(config.enabled || false)
        setLastAutoSync(config.lastSync)
      }
    }
  }, [isOpen])

  const setupAutoSync = async () => {
    if (!isFileSystemAccessSupported) {
      alert('Seu navegador não suporta sincronização automática. Use Exportar/Importar manualmente.')
      return
    }

    try {
      // Solicitar acesso a um diretório
      const dirHandle = await window.showDirectoryPicker()
      
      // Criar/acessar arquivo de sincronização
      const fileName = 'notes-sync.json'
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true })
      
      setSyncFile({ dirHandle, fileHandle, fileName })
      setAutoSyncEnabled(true)
      
      // Salvar configuração
      const config = {
        enabled: true,
        lastSync: new Date().toISOString()
      }
      localStorage.setItem('autoSyncConfig', JSON.stringify(config))
      
      // Fazer sync inicial
      await performSync(fileHandle)
      
      alert('✅ Sincronização automática configurada!')
      
    } catch (error) {
      console.error('Erro ao configurar sincronização:', error)
      alert('❌ Erro ao configurar sincronização automática')
    }
  }

  const performSync = async (fileHandle) => {
    try {
      // Exportar dados atuais
      const exportData = {
        notes,
        timestamp: new Date().toISOString(),
        version: '2.0',
        source: 'auto-sync'
      }
      
      // Escrever no arquivo
      const writable = await fileHandle.createWritable()
      await writable.write(JSON.stringify(exportData, null, 2))
      await writable.close()
      
      setLastAutoSync(new Date().toISOString())
      
      // Atualizar configuração
      const config = {
        enabled: true,
        lastSync: new Date().toISOString()
      }
      localStorage.setItem('autoSyncConfig', JSON.stringify(config))
      
    } catch (error) {
      console.error('Erro no sync automático:', error)
    }
  }

  const loadFromSyncFile = async () => {
    if (!syncFile) return

    try {
      const file = await syncFile.fileHandle.getFile()
      await importNotes(file)
      alert('✅ Dados sincronizados com sucesso!')
    } catch (error) {
      console.error('Erro ao carregar sync:', error)
      alert('❌ Erro ao carregar dados de sincronização')
    }
  }

  const disableAutoSync = () => {
    setAutoSyncEnabled(false)
    setSyncFile(null)
    localStorage.removeItem('autoSyncConfig')
    alert('Sincronização automática desabilitada')
  }

  // Sync automático quando houver mudanças nas notas
  useEffect(() => {
    if (autoSyncEnabled && syncFile && notes.length > 0) {
      const timeoutId = setTimeout(() => {
        performSync(syncFile.fileHandle)
      }, 2000) // Aguarda 2 segundos após mudança

      return () => clearTimeout(timeoutId)
    }
  }, [notes, autoSyncEnabled, syncFile])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="sync-modal-overlay" onClick={handleOverlayClick}>
      <div className="sync-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sync-modal-header">
          <h2>⚙️ Configurações de Sincronização</h2>
          <button onClick={onClose} className="close-modal-btn">✕</button>
        </div>

        <div className="sync-tabs">
          <button 
            className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            📋 Manual
          </button>
          <button 
            className={`tab-btn ${activeTab === 'auto' ? 'active' : ''}`}
            onClick={() => setActiveTab('auto')}
          >
            🔄 Automática
          </button>
        </div>

        <div className="sync-content">
          {activeTab === 'manual' && (
            <div className="manual-sync-tab">
              <div className="sync-info-box">
                <h3>📋 Sincronização Manual</h3>
                <p className="info-text">
                  O IndexedDB é isolado por navegador e origem. Chrome, Firefox, Edge mantêm bancos separados por segurança.
                </p>
                
                <div className="sync-steps">
                  <div className="sync-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <strong>Exportar:</strong> Clique em "💾 Exportar" ou use Ctrl+E para fazer backup
                    </div>
                  </div>

                  <div className="sync-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <strong>Importar:</strong> Clique em "📥 Importar" ou use Ctrl+I no outro navegador
                    </div>
                  </div>

                  <div className="sync-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <strong>Selecionar:</strong> Escolha o arquivo .json exportado
                    </div>
                  </div>

                  <div className="sync-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <strong>Pronto!</strong> Merge inteligente mantém a versão mais recente
                    </div>
                  </div>
                </div>

                <div className="sync-tips">
                  <div className="tip">
                    <strong>💡 Dica:</strong> Faça backups regulares. O arquivo JSON funciona em qualquer navegador!
                  </div>
                  <div className="tip">
                    <strong>🔄 Merge Inteligente:</strong> Sistema compara datas e mantém sempre a versão mais recente.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'auto' && (
            <div className="auto-sync-tab">
              {!isFileSystemAccessSupported ? (
                <div className="sync-not-supported">
                  <h3>🚫 Não Suportado</h3>
                  <p>Seu navegador não suporta sincronização automática via arquivo.</p>
                  <p>Use a <strong>Sincronização Manual</strong> para transferir anotações entre navegadores.</p>
                </div>
              ) : !autoSyncEnabled ? (
                <div className="auto-sync-setup">
                  <h3>🔄 Configurar Sincronização Automática</h3>
                  <p>
                    Configure um arquivo de sincronização compartilhado para manter suas anotações 
                    automaticamente sincronizadas entre diferentes navegadores no mesmo computador.
                  </p>
                  
                  <div className="setup-features">
                    <div className="feature">✅ Sincronização automática a cada mudança</div>
                    <div className="feature">✅ Funciona entre abas e navegadores</div>
                    <div className="feature">✅ Arquivo local seguro</div>
                    <div className="feature">✅ Backup contínuo</div>
                  </div>

                  <button 
                    onClick={setupAutoSync}
                    className="btn btn-primary setup-btn"
                  >
                    📁 Configurar Arquivo de Sincronização
                  </button>
                </div>
              ) : (
                <div className="auto-sync-active">
                  <h3>✅ Sincronização Automática Ativa</h3>
                  
                  <div className="sync-status-card">
                    <div className="status-info">
                      <div className="status-indicator active">●</div>
                      <div>
                        <strong>Status:</strong> Sincronização ativa
                        {lastAutoSync && (
                          <div className="last-sync-time">
                            Último sync: {new Date(lastAutoSync).toLocaleString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="sync-controls">
                    <button 
                      onClick={loadFromSyncFile}
                      className="btn btn-secondary"
                      title="Carregar dados do arquivo de sincronização"
                    >
                      📥 Carregar do Arquivo
                    </button>
                    <button 
                      onClick={() => syncFile && performSync(syncFile.fileHandle)}
                      className="btn btn-secondary"
                      title="Forçar sincronização agora"
                    >
                      🔄 Sincronizar Agora
                    </button>
                    <button 
                      onClick={disableAutoSync}
                      className="btn btn-danger"
                      title="Desabilitar sincronização automática"
                    >
                      ❌ Desabilitar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SyncConfigModal