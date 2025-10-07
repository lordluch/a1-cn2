# AutoRental - Sistema de Locação de Automóveis

Sistema completo de locação de automóveis desenvolvido com Next.js 15, React 19, TypeScript e integração com Azure Storage.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Dashboard Administrativo**: Visão geral com estatísticas do sistema
- **Gerenciamento de Veículos**: CRUD completo com upload de imagens
- **Gerenciamento de Clientes**: Cadastro e edição de clientes
- **Gerenciamento de Locações**: Criação e controle de locações
- **Interface Responsiva**: Design moderno com Tailwind CSS
- **Integração Azure**: Blob Storage para imagens e Table Storage para dados
- **Validação de Formulários**: Validação robusta com react-hook-form e Zod
- **Sistema de Busca e Filtros**: Busca avançada em todas as seções

### 🔧 Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Formulários**: React Hook Form + Zod
- **Ícones**: Lucide React
- **Azure**: Blob Storage + Table Storage
- **Utilitários**: date-fns, clsx, uuid

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta Azure com Storage Account configurada
- Chaves de acesso do Azure Storage

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd cn2-p1
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env.local` na raiz do projeto:
```env
# Azure Storage Configuration
AZURE_STORAGE_CONNECTION_STRING=sua_connection_string_aqui
AZURE_STORAGE_ACCOUNT_NAME=seu_account_name
AZURE_BLOB_CONTAINER_NAME=vehicle-images
AZURE_TABLE_NAME=rentaldata

# Application Configuration
NEXT_PUBLIC_APP_NAME=AutoRental
NEXT_PUBLIC_APP_VERSION=1.0.0
```

4. **Execute o projeto**
```bash
npm run dev
```

5. **Acesse a aplicação**
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📱 Como Usar

### Dashboard
- Acesse a página inicial para ver estatísticas gerais
- Navegue pelas diferentes seções usando o menu superior

### Veículos
- **Listar**: Visualize todos os veículos cadastrados
- **Cadastrar**: Adicione novos veículos com fotos
- **Editar**: Modifique informações dos veículos
- **Excluir**: Remova veículos da frota
- **Buscar**: Use filtros para encontrar veículos específicos

### Clientes
- **Listar**: Visualize todos os clientes cadastrados
- **Cadastrar**: Adicione novos clientes
- **Editar**: Modifique dados dos clientes
- **Excluir**: Remova clientes do sistema
- **Buscar**: Use filtros para encontrar clientes específicos

### Locações
- **Listar**: Visualize todas as locações
- **Criar**: Crie novas locações selecionando veículo e cliente
- **Editar**: Modifique informações das locações
- **Cancelar**: Cancele locações quando necessário
- **Filtrar**: Use filtros por status, datas, etc.

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # Páginas da aplicação
│   ├── page.tsx           # Dashboard principal
│   ├── vehicles/          # Gerenciamento de veículos
│   ├── customers/         # Gerenciamento de clientes
│   └── rentals/           # Gerenciamento de locações
├── components/            # Componentes reutilizáveis
│   ├── layout/           # Layout e navegação
│   └── ui/               # Componentes de interface
├── lib/                  # Utilitários e serviços
│   ├── azure.ts          # Integração com Azure
│   └── utils.ts          # Funções utilitárias
└── types/                # Definições TypeScript
    └── index.ts          # Interfaces e tipos
```

## 🔐 Configuração do Azure

### Storage Account
1. Crie uma Storage Account no Azure
2. Configure os containers:
   - `vehicle-images` para armazenar fotos dos veículos
3. Configure as tabelas:
   - `rentaldata` para armazenar dados estruturados

### Permissões Necessárias
- **Blob Storage**: Read, Write, Delete, List
- **Table Storage**: Read, Write, Delete, Query

## 📊 Funcionalidades Técnicas

### Validação de Dados
- CPF com validação de dígitos verificadores
- Email com validação de formato
- Telefone com validação de formato brasileiro
- Datas com validação de período

### Upload de Imagens
- Suporte a PNG, JPG, JPEG
- Tamanho máximo de 10MB
- Redimensionamento automático
- Armazenamento no Azure Blob Storage

### Responsividade
- Design mobile-first
- Breakpoints otimizados
- Navegação adaptativa
- Componentes flexíveis

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas
- Configure as variáveis de ambiente
- Execute `npm run build`
- Execute `npm start`

## 📝 Licença

Este projeto foi desenvolvido para fins acadêmicos como parte do curso de Computação em Nuvem.

## 👨‍💻 Desenvolvido por

[Seu Nome] - Fatec São Paulo

---

**Nota**: Certifique-se de configurar corretamente as credenciais do Azure Storage antes de usar a aplicação em produção.