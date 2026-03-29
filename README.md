# App Manutenção

<p align="center">
  <img src="client/public/logo-manutencao.png" alt="App Manutenção Logo" width="120">
</p>

<p align="center">
  <strong>Sistema Universal de Gestão de Manutenção</strong><br>
  Predial • Industrial • Comercial • Hospitalar • Escolar • Máquinas
</p>

<p align="center">
  <a href="#funcionalidades">Funcionalidades</a> •
  <a href="#tecnologias">Tecnologias</a> •
  <a href="#instalação">Instalação</a> •
  <a href="#uso">Uso</a> •
  <a href="#mobile">Mobile</a> •
  <a href="#licença">Licença</a>
</p>

---

## Sobre

O **App Manutenção** é uma plataforma completa para gestão de manutenções em qualquer tipo de organização. Desenvolvido com tecnologias modernas, oferece uma experiência premium para registro, acompanhamento e relatórios de todas as atividades de manutenção.

### Setores Atendidos

| Setor | Descrição |
|-------|-----------|
| 🏢 **Predial** | Condomínios, edifícios comerciais e residenciais |
| 🏭 **Industrial** | Fábricas, galpões e plantas industriais |
| 🏪 **Comercial** | Lojas, shoppings e centros comerciais |
| 🏥 **Hospitalar** | Hospitais, clínicas e laboratórios |
| 🏫 **Escolar** | Escolas, universidades e centros de formação |
| ⚙️ **Máquinas** | Equipamentos, veículos e maquinário |

---

## Funcionalidades

### Módulos Principais

- **📋 Ordens de Serviço** - Gestão completa de OS com categorias, prioridades, status personalizáveis e anexos (PDF, imagens, documentos)
- **🔍 Vistorias** - Registro de vistorias com fotos, localização GPS e relatórios
- **🔧 Manutenções** - Controle de manutenções preventivas e corretivas
- **⚠️ Ocorrências** - Registro e acompanhamento de ocorrências
- **✅ Checklists** - Listas de verificação personalizáveis
- **📅 Agenda de Vencimentos** - Controle de prazos e vencimentos

### Funções Rápidas

Sistema de registro rápido com um clique para:
- Vistoria Rápida
- Manutenção Rápida
- Ocorrência Rápida
- Antes/Depois Rápido
- Checklist Rápido

### Recursos Adicionais

- **📎 Sistema de Anexos** - Upload de PDF, Word, Excel e imagens nas OS
- **📍 Localização GPS** - Captura automática de coordenadas
- **📊 Relatórios PDF** - Geração automática de relatórios profissionais
- **👥 Gestão de Equipes** - Controle de membros e permissões
- **🎨 Personalização** - Cores, logo e configurações customizáveis

---

## Tecnologias

### Frontend
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **shadcn/ui** - Componentes UI
- **tRPC** - API type-safe

### Backend
- **Node.js** - Runtime
- **Express 4** - Servidor HTTP
- **tRPC 11** - API RPC
- **Drizzle ORM** - ORM para banco de dados

### Banco de Dados
- **MySQL/TiDB** - Banco de dados relacional

### Mobile
- **Capacitor 8** - Apps nativos iOS e Android

### Armazenamento
- **AWS S3** - Armazenamento de arquivos

---

## Instalação

### Pré-requisitos

- Node.js 18+
- pnpm 8+
- MySQL 8+ ou TiDB

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/niggl1/manutencao-universal.git
cd manutencao-universal
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=seu-jwt-secret
# ... outras variáveis
```

4. **Execute as migrações do banco de dados**
```bash
pnpm db:push
```

5. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

O aplicativo estará disponível em `http://localhost:3000`

---

## Uso

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia o servidor de desenvolvimento |
| `pnpm build` | Compila o projeto para produção |
| `pnpm start` | Inicia o servidor de produção |
| `pnpm check` | Verifica erros TypeScript |
| `pnpm test` | Executa os testes |
| `pnpm db:push` | Aplica migrações do banco de dados |

### Estrutura do Projeto

```
app-manutencao/
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── contexts/     # Contextos React
│   │   ├── hooks/        # Hooks customizados
│   │   └── lib/          # Utilitários e configurações
│   └── public/           # Arquivos estáticos
├── server/               # Backend Express + tRPC
│   ├── _core/            # Core do servidor
│   ├── routers.ts        # Rotas tRPC
│   └── db.ts             # Helpers do banco de dados
├── drizzle/              # Schema e migrações
├── android/              # Projeto Android (Capacitor)
├── ios/                  # Projeto iOS (Capacitor)
└── shared/               # Tipos e constantes compartilhados
```

---

## Mobile

O App Manutenção suporta compilação para dispositivos móveis usando Capacitor.

### Android

1. **Compile o cliente**
```bash
pnpm cap:build:android
```

2. **Abra no Android Studio**
```bash
pnpm cap:open:android
```

3. **Gere o APK** através do Android Studio (Build > Build Bundle(s) / APK(s) > Build APK(s))

### iOS

1. **Compile o cliente**
```bash
pnpm cap:build:ios
```

2. **Abra no Xcode**
```bash
pnpm cap:open:ios
```

3. **Gere o IPA** através do Xcode

### Configuração do Capacitor

O arquivo `capacitor.config.ts` contém as configurações do app:

```typescript
{
  appId: 'com.appmanutencao.app',
  appName: 'App Manutenção',
  webDir: 'client/dist',
  // ...
}
```

---

## Testes

O projeto utiliza Vitest para testes automatizados.

```bash
# Executar todos os testes
pnpm test

# Executar testes em modo watch
pnpm test --watch
```

### Cobertura de Testes

- Autenticação e logout
- CRUD de tarefas simples
- Templates de campos rápidos
- Rotas protegidas

---

## Deploy

### Web (Manus)

O deploy pode ser feito diretamente através da plataforma Manus:
1. Crie um checkpoint
2. Clique no botão "Publish" na interface

### Vercel/Railway

1. Configure as variáveis de ambiente
2. Execute `pnpm build`
3. Deploy do diretório `dist`

---

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## Contato

- **Website**: [appmanutencao.com](https://appmanutencao.com)
- **Email**: contato@appmanutencao.com

---

<p align="center">
  Desenvolvido com ❤️ para gestores de manutenção
</p>
