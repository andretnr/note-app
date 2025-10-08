# 📝 Bloco de Anotações com IndexedDB

Sistema avançado de anotações com persistência local usando IndexedDB, tema escuro modern#### ⌨️ Atalhos de Teclado
- `Ctrl + N` - **Nova anotação**
- `Ctrl + E` - **Exportar dados**
- `Ctrl + I` - **Importar arquivo**
- `Escape` - **Fechar modais**

#### ⚙️ Configurações de Sincronização
1. Clique no ícone **⚙️** no header
2. Escolha entre **Manual** ou **Automática**:
   - **Manual**: Exportar/Importar arquivos JSON
   - **Automática**: File System Access API (Chrome/Edge)
3. Configure arquivo compartilhado para sync automático
4. Monitore status e controle sincronização sincronização inteligente entre navegadores.

## ✨ Recursos Completos

### 🎯 Funcionalidades Principais
- **✅ Interface Moderna**: Design dark theme elegante e responsivo
- **✅ IndexedDB**: Armazenamento ilimitado e performance superior
- **✅ Sincronização Inteligente**: Manual e automática entre navegadores
- **✅ Busca Avançada**: Por assunto, conteúdo ou data com filtros
- **✅ Exportação/Importação**: Backup completo em JSON com merge inteligente
- **✅ Modal de Configurações**: Interface completa para gerenciar sincronização
- **✅ Atalhos de Teclado**: Ctrl+N, Ctrl+E, Ctrl+I e Escape
- **✅ Performance**: Otimizado para milhares de anotações
- **✅ Offline First**: Funciona completamente offline
- **✅ Cross-Browser**: Sincronização entre Chrome, Firefox, Safari, Edge

### 📊 Estatísticas da Versão 3.0
- **Componentes React**: 9 componentes modulares (+ SyncConfigModal)
- **Hooks Customizados**: useIndexedDB com sistema avançado de persistência
- **Linhas de CSS**: +1400 linhas com tema escuro e animações
- **Persistência**: IndexedDB com capacidade ilimitada e índices otimizados
- **Sincronização**: Modal com abas Manual/Automática + File System Access API
- **Atalhos**: 4 atalhos de teclado (Nova, Exportar, Importar, Modal)
- **Arquitetura**: Sistema robusto com merge inteligente e resolução de conflitos
- **Compatibilidade**: Todos os navegadores modernos + funcionalidades progressivas
- **Performance**: Otimizado para milhares de registros com debounce automático

## 🚀 Opções de Execução

### 📱 Opção 1: Arquivo HTML Standalone (RECOMENDADO)

**✨ Uso Imediato - Sem Instalação:**

1. **Abra o arquivo**: `bloco-de-anotacoes-standalone.html`
2. **Funciona offline** após carregar
3. **Zero configuração** necessária

**🎯 Vantagens:**
- ✅ **Não precisa instalar Node.js**
- ✅ **Funciona offline**
- ✅ **Portável** - pode ser enviado por email
- ✅ **Compatível** com qualquer navegador moderno
- ✅ **Sem dependências** externas

### 💻 Opção 2: Projeto React (Para Desenvolvimento)

**Para customização avançada:**

#### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

#### Instalação

1. **Clone o repositório** ou navegue até a pasta do projeto:
```bash
cd notes-app
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

4. **Abra seu navegador:** `http://localhost:5173`

## 🎯 Como Usar o Aplicativo

### � Início Rápido
Você tem **duas opções** para usar o bloco de anotações:

#### Opção 1: Arquivo HTML Standalone (RECOMENDADO) ⭐
1. **Abra o arquivo** `bloco-de-anotacoes-standalone.html` diretamente no navegador
2. **Funciona offline** - não precisa de internet após carregar
3. **Não precisa instalar nada** - nem Node.js nem dependências

#### Opção 2: Projeto React Completo 
1. Instale o Node.js
2. Execute `npm install` e `npm run dev`
3. Ideal para desenvolvimento ou customização avançada

### 📝 Funcionalidades Completas

#### ✨ Criando uma Nova Anotação
1. Clique no botão **"+ Nova Anotação"** (ou pressione `Ctrl + N`)
2. Preencha o **Assunto** (título da anotação)
3. Escolha uma **Categoria** (Geral, Trabalho, Pessoal, etc.)
4. Digite o **Conteúdo** da anotação
5. Clique em **"Salvar"**

#### ✏️ Editando Anotações
1. Clique no ícone **✏️** no card da anotação
2. Modifique o assunto, conteúdo ou categoria
3. Clique em **✅** para salvar ou **❌** para cancelar
4. Anotações editadas mostram indicador "• Editado"

#### 🔍 Pesquisando Anotações
1. Use a **barra de pesquisa** no topo
2. Escolha o tipo de busca:
   - **Por Assunto**: Digite palavras-chave do título
   - **Por Data**: Digite a data no formato dd/mm/aaaa
3. Os resultados são **filtrados automaticamente**
4. Veja o contador de anotações encontradas

#### 🗂️ Organizando por Categorias
- **📋 Geral** - Anotações diversas
- **💼 Trabalho** - Notas profissionais
- **👤 Pessoal** - Assuntos pessoais
- **📚 Estudo** - Conteúdo educacional
- **💡 Ideias** - Inspirações e insights
- **✅ Tarefas** - Lista de afazeres
- **🛒 Compras** - Lista de compras
- **✈️ Viagem** - Planejamento de viagens

#### 📤 Exportando Dados
1. Clique no botão **"📤 Exportar"**
2. Baixe um arquivo JSON com todas suas anotações
3. Use como backup ou para importar em outro dispositivo

#### 🗑️ Excluindo Anotações
- Clique no ícone **🗑️** no canto superior direito de qualquer card
- Confirme a exclusão quando solicitado

### ⌨️ Atalhos de Teclado
- `Ctrl + N` - **Nova anotação**
- `Escape` - **Fechar formulário**

### 💡 Dicas de Uso Avançado

#### 🎯 Organização Eficiente
- **Use categorias** para separar contextos (trabalho, pessoal, etc.)
- **Títulos descritivos** facilitam a busca posterior
- **Exporte regularmente** seus dados como backup

#### 🔍 Busca Inteligente
- **Busca por assunto**: Encontre anotações por palavra-chave
- **Busca por data**: Útil para anotações de reuniões ou eventos específicos
- **Combine filtros**: Use termos específicos para resultados precisos

#### 💾 Persistência de Dados
- **Automático**: Suas anotações são salvas automaticamente
- **Local**: Dados ficam no seu navegador (localStorage)
- **Backup**: Use a função exportar para criar backups

#### 📱 Uso Mobile
- **Interface responsiva** funciona perfeitamente no celular
- **Touch-friendly**: Botões otimizados para toque
- **Layout adaptativo** se ajusta automaticamente

### 🔧 Solução de Problemas

#### Se as anotações sumirem:
1. Verifique se está usando o mesmo navegador
2. Não use modo privado/incógnito
3. Não limpe os dados do navegador
4. Use a função exportar para backup preventivo

#### Para resetar completamente:
1. Abra as ferramentas do desenvolvedor (F12)
2. Console → digite: `localStorage.clear()`
3. Recarregue a página

## 🎨 Tecnologias Utilizadas

- **React 18**: Biblioteca principal para UI com hooks avançados
- **IndexedDB**: Banco de dados nativo do navegador com capacidade ilimitada
- **Vite**: Build tool ultrarrápida com Hot Module Replacement
- **CSS3**: Dark theme moderno com animações e responsividade total
- **File System Access API**: Sincronização automática (Chrome/Edge)
- **Web Storage API**: Configurações e cache de sincronização

## 📂 Estrutura do Projeto

```
notes-app/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Cabeçalho da aplicação
│   │   ├── SearchBar.jsx       # Barra de pesquisa
│   │   ├── NoteForm.jsx        # Formulário para nova anotação
│   │   ├── NotesList.jsx       # Lista de anotações
│   │   └── NoteCard.jsx        # Card individual da anotação
│   ├── styles/
│   │   ├── index.css           # Estilos globais
│   │   └── App.css             # Estilos principais
│   ├── App.jsx                 # Componente principal
│   └── main.jsx                # Ponto de entrada
├── index.html                  # Template HTML
├── package.json                # Dependências e scripts
└── vite.config.js             # Configuração do Vite
```

## 🎯 Características de Design

- **Interface Limpa**: Foco no conteúdo sem distrações
- **Gradientes Modernos**: Cores suaves e profissionais
- **Animações Sutis**: Hover effects e transições suaves
- **Tipografia Clara**: Fonts legíveis e hierarquia visual
- **Layout Responsivo**: Adaptável a diferentes tamanhos de tela

## 💾 Armazenamento

As anotações são salvas automaticamente no **localStorage** do navegador, garantindo que seus dados persistam entre sessões, mesmo sem conexão com a internet.

## 🔧 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria a versão de produção
- `npm run preview`: Visualiza a build de produção
- `npm run lint`: Executa o linter para verificar o código

## 📱 Responsividade

O aplicativo é totalmente responsivo, adaptando-se automaticamente para:
- **Desktop**: Layout em grid com múltiplas colunas
- **Tablet**: Ajuste automático do número de colunas
- **Mobile**: Layout em coluna única otimizado para toque

## 🌟 Versão Standalone

A versão **`bloco-de-anotacoes-standalone.html`** é uma implementação completa em um único arquivo HTML que inclui:

### ✨ Características Técnicas:
- **React 18** carregado via CDN
- **Babel** para transpilar JSX em tempo real
- **CSS inline** com todas as animações e responsividade
- **LocalStorage** para persistência automática
- **Zero dependências** locais

### 🎯 Ideal Para:
- **Uso pessoal** sem complicações
- **Compartilhamento** via email ou pen drive
- **Ambientes** onde não é possível instalar Node.js
- **Prototipagem rápida** de ideias
- **Backup portátil** de suas anotações

### 💡 Dica Profissional:
Salve o arquivo `bloco-de-anotacoes-standalone.html` em sua área de trabalho ou pasta de favoritos para acesso rápido às suas anotações a qualquer momento!

## 🛠️ Desenvolvimento e Contribuição

### 🔧 Arquitetura do Projeto:
- **Componentes React** modulares e reutilizáveis
- **Hooks customizados** para localStorage
- **CSS responsivo** com media queries
- **Estados gerenciados** com React Hooks
- **Tratamento de erros** robusto

### 🚀 Possíveis Melhorias Futuras:
- **Sincronização em nuvem** (Google Drive, Dropbox)
- **Temas** claros e escuros
- **Anexos** de arquivos às anotações
- **Compartilhamento** de anotações específicas
- **Busca avançada** com filtros combinados
- **Marcação** de anotações importantes
- **Lembretes** com notificações

## 🤝 Contribuições

Sinta-se livre para:
- **Reportar bugs** ou problemas
- **Sugerir melhorias** ou novas funcionalidades  
- **Fazer fork** do projeto para customizações
- **Compartilhar** sua experiência de uso

## 📄 Licença

Este projeto foi desenvolvido para uso pessoal e educacional. Sinta-se livre para usar, modificar e distribuir.

---

**🎉 Desenvolvido com ❤️ em React para tornar suas anotações mais organizadas e acessíveis!**

**📝 Versão atual**: 3.0 - Dark Theme + Sync Modal  
**🗓️ Última atualização**: Outubro 2025  
**🎨 Novidades**: Tema escuro, modal de sincronização, File System Access API