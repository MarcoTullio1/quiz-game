<p align="center">
  <img src="https://img.shields.io/badge/license-GPLv3-blue.svg" alt="License GPLv3"/>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socket.io&logoColor=white" alt="Socket.IO"/>
  <img src="https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker"/>
</p>

---

<p align="center">
  <a href="#-sobre-o-projeto">Português</a> •
  <a href="#-about-the-project">English</a>
</p>

---

# 🎮 Interactive Quiz Game

> Sistema de Quiz Interativo em Tempo Real — Clone do Kahoot

---

# 🇧🇷 Português

## 📖 Sobre o Projeto

**Interactive Quiz Game** é um sistema de quiz interativo em tempo real, inspirado no Kahoot, desenvolvido para eventos, treinamentos corporativos, salas de aula e competições. O projeto foi construído com **Node.js**, **Socket.IO**, **Express** e **MySQL**, oferecendo uma experiência completa e profissional.

### ✨ Destaques

- 🏆 **Suporte a múltiplos times** — Organize competições em equipe
- 📱 **Entrada via QR Code** — Participantes entram escaneando o código pelo celular
- 🖥️ **Telão (Display)** — Exiba perguntas e ranking ao vivo em projetores
- 📊 **Gráficos em tempo real** — Acompanhe o desempenho instantaneamente
- ⚙️ **Painel Administrativo** — Gerencie jogos, times e perguntas com facilidade

---

## 📸 Screenshots

### Painel Administrativo

| Gerenciar Times | Controle do Jogo |
|:---------------:|:----------------:|
| ![Painel Admin - Times](https://github.com/user-attachments/assets/4bec97b1-619b-4432-b38e-6cf53ae4fd4f) | ![Controle do Jogo](https://github.com/user-attachments/assets/b2412a17-f5bc-4ebb-a663-101d0d30a5ef) |

### Telão (Display)

| Seleção de Quiz | Aguardando Início | Gráfico de Respostas |
|:---------------:|:-----------------:|:--------------------:|
| ![Seleção de Quiz](https://github.com/user-attachments/assets/ef405f4d-6cd3-4237-a1e6-042a52d2cce8) | ![Aguardando Início](https://github.com/user-attachments/assets/b630980c-1b6f-4b59-9d7f-75c3df90bf8b) | ![Gráfico ao Vivo](https://github.com/user-attachments/assets/c6530cda-1cdc-496b-b818-aabb4eba14c2) |

| Pódio Final |
|:-----------:|
| ![Pódio Final](https://github.com/user-attachments/assets/44fa1ae5-3bcd-4ebc-b842-5d832baa283f) |

### Tela do Jogador (Mobile)

| Responder Pergunta | Resposta Correta | Resposta Incorreta |
|:------------------:|:----------------:|:------------------:|
| ![Tela de Pergunta](https://github.com/user-attachments/assets/09fd45ff-9ebb-4fb8-ab57-a9b556c85f7e) | ![Resposta Correta](https://github.com/user-attachments/assets/c2c6e22d-658d-4d01-b1b3-6a1da1a5fd2c) | ![Resposta Incorreta](https://github.com/user-attachments/assets/9a861df9-ca68-4f15-bf43-36504d9fed88) |

---

## 🚀 Funcionalidades

### 🎯 Criação e Gerenciamento
- ✅ Criação de **jogos e perguntas ilimitadas**
- ✅ Suporte a **múltiplos times** por partida
- ✅ **Painel administrativo** completo e intuitivo

### 📲 Experiência do Participante
- ✅ Entrada rápida via **QR Code** ou **Código de Sala**
- ✅ Interface responsiva otimizada para **celulares**
- ✅ **Sistema Anti-Cola** — feedback tardio no dispositivo do jogador

### 📊 Pontuação e Ranking
- ✅ **Pontuação automática** baseada em velocidade e acerto
- ✅ **Ranking em tempo real** atualizado a cada resposta
- ✅ **Pódio final** com os vencedores da partida

### 🖥️ Telão (Display)
- ✅ Exibição de perguntas em **tela cheia**
- ✅ **Gráficos ao vivo** com estatísticas das respostas
- ✅ Animações e transições profissionais

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

| Requisito | Versão Mínima |
|-----------|---------------|
| **Node.js** | 18+ |
| **NPM** | 9+ |
| **MySQL** | 8.0+ |
| **Git** | 2.x |

> 💡 **Dica:** Você pode usar o **Docker** para subir o MySQL rapidamente sem instalação local.

---

## 🛠️ Instalação e Configuração

### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/MarcoTullio1/quiz-game.git
cd quiz-game
```

### 2️⃣ Instalar Dependências

```bash
npm install --legacy-peer-deps
```

### 3️⃣ Configurar o Banco de Dados

Escolha **uma** das opções abaixo:

<details>
<summary><strong>✅ Opção A — Docker (Recomendada)</strong></summary>

```bash
# Criar e iniciar container MySQL
docker run --name quiz-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=kahoot_system \
  -p 3306:3306 \
  -d mysql:8

# Aguarde ~15 segundos para o MySQL iniciar

# Importar schema do banco (Linux/Mac)
cat ./scripts/database-schema.sql | docker exec -i quiz-mysql mysql -u root -proot kahoot_system

# Importar schema do banco (Windows PowerShell)
Get-Content .\scripts\database-schema.sql | docker exec -i quiz-mysql mysql -u root -proot kahoot_system
```

</details>

<details>
<summary><strong>✅ Opção B — MySQL Local / XAMPP</strong></summary>

1. Crie o banco de dados:
   ```sql
   CREATE DATABASE kahoot_system;
   ```

2. Importe o schema:
   ```bash
   mysql -u root -p kahoot_system < scripts/database-schema.sql
   ```

   Ou importe via **phpMyAdmin** / **MySQL Workbench**.

</details>

### 4️⃣ Configurar Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=kahoot_system
PORT=3000
```

> ⚠️ **Importante:** Nunca suba credenciais reais para o GitHub. Adicione `.env` ao `.gitignore`.

### 5️⃣ Iniciar o Servidor

```bash
# Opção 1: Node direto
node server.js

# Opção 2: NPM
npm start
```

O servidor estará disponível em: **http://localhost:3000**

---

## ▶️ Como Usar

### 👨‍💼 Painel Admin
**URL:** `http://localhost:3000/admin.html`

- Criar novos jogos
- Adicionar times (QR Code gerado automaticamente)
- Criar perguntas e respostas
- Iniciar e controlar partidas

### 🖥️ Telão (Projetor)
**URL:** `http://localhost:3000/display.html`

- Exibe perguntas em tempo real
- Mostra ranking atualizado
- Gráficos de respostas ao vivo
- Pódio final com vencedores

### 📱 Participantes (Celular)
1. Escanear o **QR Code** exibido no admin/telão
2. Ou acessar o link com o **código da sala**
3. Responder rapidamente ⚡ — quanto mais rápido, mais pontos!

---

## ☁️ Guia de Deploy (AWS)

### Arquitetura Recomendada

```
┌─────────────────┐      ┌─────────────────┐
│   AWS EC2       │      │   AWS RDS       │
│   (Node.js)     │◄────►│   (MySQL)       │
│   t2.micro      │      │   db.t3.micro   │
└─────────────────┘      └─────────────────┘
```

### 1️⃣ Configurar Banco de Dados (RDS)

1. Acesse o **AWS Console** → **RDS** → **Create database**
2. Selecione **MySQL** + **Free tier**
3. Configure:
   - **DB Instance:** `quiz-game-db`
   - **Username:** `admin`
   - **Password:** Senha forte
   - **Public access:** Yes
4. Anote o **Endpoint** após a criação

### 2️⃣ Configurar Servidor (EC2)

```bash
# Conectar na instância EC2
ssh -i sua-chave.pem ec2-user@seu-ip-ec2

# Instalar Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# Clonar projeto
git clone https://github.com/MarcoTullio1/quiz-game.git
cd quiz-game
npm install --legacy-peer-deps

# Configurar .env com endpoint do RDS
nano .env
```

### 3️⃣ Rodar com PM2 (Produção)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar aplicação
pm2 start server.js --name quiz-game

# Configurar para iniciar no boot
pm2 startup
pm2 save
```

### 4️⃣ Liberar Portas no Security Group

- **EC2:** Porta `3000` (ou `80` se usar nginx)
- **RDS:** Porta `3306` (acesso apenas do EC2)

---

## 📁 Estrutura do Projeto

```
quiz-game/
├── public/              # Arquivos estáticos (HTML, CSS, JS)
│   ├── admin.html       # Painel administrativo
│   ├── display.html     # Telão para projetor
│   └── player.html      # Interface do jogador
├── scripts/
│   └── database-schema.sql
├── server.js            # Servidor principal
├── package.json
├── .env.example
├── LICENSE              # GPLv3
└── README.md
```

---

## 📄 Licença

Este projeto está licenciado sob a **GNU General Public License v3.0 (GPLv3)**.

Você pode:
- ✅ Usar comercialmente
- ✅ Modificar
- ✅ Distribuir
- ✅ Usar de forma privada

Desde que:
- 📌 Mantenha o código-fonte aberto
- 📌 Mantenha a mesma licença (GPLv3)
- 📌 Documente as alterações

Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👏 Créditos

**Desenvolvido por [Marco Tullio](https://github.com/MarcoTullio1)**

> 💬 *Se você usar ou modificar este projeto, por favor mantenha os créditos e a licença open-source. Contribuições são bem-vindas!*

---

<br>

---

# 🇺🇸 English

## 📖 About the Project

**Interactive Quiz Game** is a real-time interactive quiz system, inspired by Kahoot, designed for events, corporate training, classrooms, and competitions. Built with **Node.js**, **Socket.IO**, **Express**, and **MySQL**, it delivers a complete and professional experience.

### ✨ Highlights

- 🏆 **Multiple teams support** — Organize team competitions
- 📱 **QR Code entry** — Participants join by scanning a code on their phones
- 🖥️ **Display Screen** — Show questions and live rankings on projectors
- 📊 **Real-time charts** — Track performance instantly
- ⚙️ **Admin Panel** — Manage games, teams, and questions with ease

---

## 📸 Screenshots

### Admin Panel

| Manage Teams | Game Control |
|:------------:|:------------:|
| ![Admin Panel - Teams](https://github.com/user-attachments/assets/4bec97b1-619b-4432-b38e-6cf53ae4fd4f) | ![Game Control](https://github.com/user-attachments/assets/b2412a17-f5bc-4ebb-a663-101d0d30a5ef) |

### Display Screen

| Quiz Selection | Waiting to Start | Live Answer Chart |
|:--------------:|:----------------:|:-----------------:|
| ![Quiz Selection](https://github.com/user-attachments/assets/ef405f4d-6cd3-4237-a1e6-042a52d2cce8) | ![Waiting Screen](https://github.com/user-attachments/assets/b630980c-1b6f-4b59-9d7f-75c3df90bf8b) | ![Live Chart](https://github.com/user-attachments/assets/c6530cda-1cdc-496b-b818-aabb4eba14c2) |

| Final Podium |
|:------------:|
| ![Final Podium](https://github.com/user-attachments/assets/44fa1ae5-3bcd-4ebc-b842-5d832baa283f) |

### Player Screen (Mobile)

| Answer Question | Correct Answer | Wrong Answer |
|:---------------:|:--------------:|:------------:|
| ![Question Screen](https://github.com/user-attachments/assets/09fd45ff-9ebb-4fb8-ab57-a9b556c85f7e) | ![Correct Answer](https://github.com/user-attachments/assets/c2c6e22d-658d-4d01-b1b3-6a1da1a5fd2c) | ![Wrong Answer](https://github.com/user-attachments/assets/9a861df9-ca68-4f15-bf43-36504d9fed88) |

---

## 🚀 Features

### 🎯 Creation & Management
- ✅ Create **unlimited games and questions**
- ✅ Support for **multiple teams** per match
- ✅ Complete and intuitive **admin panel**

### 📲 Player Experience
- ✅ Quick entry via **QR Code** or **Room Code**
- ✅ Responsive interface optimized for **mobile devices**
- ✅ **Anti-Cheating System** — delayed feedback on player's device

### 📊 Scoring & Ranking
- ✅ **Automatic scoring** based on speed and accuracy
- ✅ **Real-time ranking** updated after each answer
- ✅ **Final podium** with match winners

### 🖥️ Display Screen
- ✅ **Full-screen** question display
- ✅ **Live charts** with answer statistics
- ✅ Professional animations and transitions

---

## 📋 Prerequisites

Before starting, make sure you have installed:

| Requirement | Minimum Version |
|-------------|-----------------|
| **Node.js** | 18+ |
| **NPM** | 9+ |
| **MySQL** | 8.0+ |
| **Git** | 2.x |

> 💡 **Tip:** You can use **Docker** to quickly spin up MySQL without local installation.

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/MarcoTullio1/quiz-game.git
cd quiz-game
```

### 2️⃣ Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3️⃣ Configure the Database

Choose **one** of the options below:

<details>
<summary><strong>✅ Option A — Docker (Recommended)</strong></summary>

```bash
# Create and start MySQL container
docker run --name quiz-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=kahoot_system \
  -p 3306:3306 \
  -d mysql:8

# Wait ~15 seconds for MySQL to start

# Import database schema (Linux/Mac)
cat ./scripts/database-schema.sql | docker exec -i quiz-mysql mysql -u root -proot kahoot_system

# Import database schema (Windows PowerShell)
Get-Content .\scripts\database-schema.sql | docker exec -i quiz-mysql mysql -u root -proot kahoot_system
```

</details>

<details>
<summary><strong>✅ Option B — Local MySQL / XAMPP</strong></summary>

1. Create the database:
   ```sql
   CREATE DATABASE kahoot_system;
   ```

2. Import the schema:
   ```bash
   mysql -u root -p kahoot_system < scripts/database-schema.sql
   ```

   Or import via **phpMyAdmin** / **MySQL Workbench**.

</details>

### 4️⃣ Configure Environment Variables

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=kahoot_system
PORT=3000
```

> ⚠️ **Important:** Never commit real credentials to GitHub. Add `.env` to `.gitignore`.

### 5️⃣ Start the Server

```bash
# Option 1: Direct Node
node server.js

# Option 2: NPM
npm start
```

The server will be available at: **http://localhost:3000**

---

## ▶️ How to Use

### 👨‍💼 Admin Panel
**URL:** `http://localhost:3000/admin.html`

- Create new games
- Add teams (QR Code auto-generated)
- Create questions and answers
- Start and control matches

### 🖥️ Display Screen (Projector)
**URL:** `http://localhost:3000/display.html`

- Shows questions in real-time
- Displays updated ranking
- Live answer charts
- Final podium with winners

### 📱 Participants (Mobile)
1. Scan the **QR Code** shown on admin/display
2. Or access the link with the **room code**
3. Answer quickly ⚡ — the faster you answer, the more points you get!

---

## ☁️ Deployment Guide (AWS)

### Recommended Architecture

```
┌─────────────────┐      ┌─────────────────┐
│   AWS EC2       │      │   AWS RDS       │
│   (Node.js)     │◄────►│   (MySQL)       │
│   t2.micro      │      │   db.t3.micro   │
└─────────────────┘      └─────────────────┘
```

### 1️⃣ Configure Database (RDS)

1. Access **AWS Console** → **RDS** → **Create database**
2. Select **MySQL** + **Free tier**
3. Configure:
   - **DB Instance:** `quiz-game-db`
   - **Username:** `admin`
   - **Password:** Strong password
   - **Public access:** Yes
4. Note the **Endpoint** after creation

### 2️⃣ Configure Server (EC2)

```bash
# Connect to EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# Clone project
git clone https://github.com/MarcoTullio1/quiz-game.git
cd quiz-game
npm install --legacy-peer-deps

# Configure .env with RDS endpoint
nano .env
```

### 3️⃣ Run with PM2 (Production)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application
pm2 start server.js --name quiz-game

# Configure auto-start on boot
pm2 startup
pm2 save
```

### 4️⃣ Open Ports in Security Group

- **EC2:** Port `3000` (or `80` if using nginx)
- **RDS:** Port `3306` (EC2 access only)

---

## 📁 Project Structure

```
quiz-game/
├── public/              # Static files (HTML, CSS, JS)
│   ├── admin.html       # Admin panel
│   ├── display.html     # Display for projector
│   └── player.html      # Player interface
├── scripts/
│   └── database-schema.sql
├── server.js            # Main server
├── package.json
├── .env.example
├── LICENSE              # GPLv3
└── README.md
```

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0 (GPLv3)**.

You can:
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Use privately

As long as:
- 📌 Keep the source code open
- 📌 Maintain the same license (GPLv3)
- 📌 Document changes

See the [LICENSE](LICENSE) file for details.

---

## 👏 Credits

**Developed by [Marco Tullio](https://github.com/MarcoTullio1)**

> 💬 *If you use or modify this project, please keep the credits and open-source license. Contributions are welcome!*

---

<p align="center">
  <strong>⭐ Se este projeto te ajudou, deixe uma estrela! | If this project helped you, leave a star! ⭐</strong>
</p>
