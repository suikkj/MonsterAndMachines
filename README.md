# 🌑 Monsters & Machines - Sculk Apocalypse

> *"Independente do que você escutar, não confie Nele. Você não vai conseguir enganar Ele."*
> — Dr. Lynnus, Grupo de Expedição 2

Um modpack de sobrevivência pós-apocalíptico para Minecraft 1.21.1 onde o mundo foi consumido pelo Vazio.

[![CurseForge](https://img.shields.io/badge/CurseForge-Download-orange?logo=curseforge)](https://www.curseforge.com/minecraft/modpacks/monstersandmachines)
![Minecraft](https://img.shields.io/badge/Minecraft-1.21.1-green)
![NeoForge](https://img.shields.io/badge/NeoForge-21.1.217-orange)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)

📥 **[Download no CurseForge](https://www.curseforge.com/minecraft/modpacks/monstersandmachines)**

## 📖 Lore

Há 2.740 anos, um vírus misterioso consumiu o mundo de Atheosis. O que antes eram reinos prósperos, florestas exuberantes e cidades grandiosas, agora são apenas ruínas cobertas por uma substância negra que pulsa com vida própria: o **"Vazio"**.

Você faz parte do **Grupo de Expedição 13**, o último grupo a sair do Refúgio Cigarra em busca de respostas e, talvez, uma cura. Doze grupos vieram antes de você. Nenhum retornou.

Através de diários e anotações espalhados pelas ruínas, você descobrirá o destino dos expedicionários anteriores — e os segredos para sobreviver nesta terra morta.

---

## ⚔️ Características Principais

### 🔮 O Vazio
- **Sculk em toda parte**: A superfície foi consumida pelo Vazio
- **Blocos indestrutíveis**: Sculk não pode ser quebrado por meios convencionais
- **Propagação**: Mobs mortos espalham mais corrupção
- **Creepers explosivos**: Explosões de Creepers espalham Sculk

### 🛡️ Sobrevivência
- **Ouro é a chave**: Equipamentos de ouro protegem contra o "Vazio"
- **Silêncio salva vidas**: Barulho atrai criaturas terríveis
- **Recursos escassos**: Comida e materiais são raros

### 📜 Expedições Perdidas
- **12 diários**: Encontre os registros dos grupos anteriores
- **Lore progressiva**: Cada grupo revela mais sobre o mundo
- **Dicas de sobrevivência**: Os mortos ensinam os vivos

### ⚙️ Tech Tiers
- **Ruínas tecnológicas**: Tecnologia antiga espera ser descoberta
- **Progressão por exploração**: Desbloqueie receitas fazendo missões
- **Create Integration**: Máquinas e automação — mas cuidado com o barulho

---

## 🎮 Mecânicas Principais

| Mecânica | Descrição |
|----------|-----------|
| **Debuffs do "Vazio"** | Pisar em Sculk causa efeitos negativos |
| **Penalidade de Morte** | Morrer remove um item aleatório do inventário |
| **Loot Restrito** | Certos itens não aparecem em baús de estruturas |
| **Mobs Aprimorados** | Criaturas mais fortes, com melhor percepção |
| **Propagação do "Vazio"** | Blocos sobre Sculk eventualmente se corrompem |

---

## 📦 Instalação

### Requisitos
- Minecraft 1.21.1
- NeoForge 21.1.217+
- Mínimo 8GB de RAM alocados

### Passos
1. Instale o [NeoForge](https://neoforged.net/) para Minecraft 1.21.1
2. Baixe todos os mods da pasta `mods/`
3. Copie as pastas `kubejs/`, `config/` e `data/` para o diretório do jogo
4. Inicie o jogo e crie um novo mundo

---

## 📁 Estrutura do Projeto

```
MM/
├── config/           # Configurações dos mods
├── kubejs/
│   ├── server_scripts/   # Scripts de servidor (loot, mecânicas)
│   └── startup_scripts/  # Scripts de inicialização (blocos, itens)
├── data/             # Datapacks customizados
└── mods/             # Mods do modpack
```

### Scripts KubeJS Principais

| Script | Função |
|--------|--------|
| `sculk_apocalypse.js` | Mecânicas base do Sculk |
| `sculk_spread.js` | Sistema de propagação |
| `lost_expeditions.js` | Livros de lore nas estruturas |
| `loot_restrictions.js` | Restrições de loot |
| `death_penalty.js` | Penalidade de morte |
| `apocalypse_attributes.js` | Atributos de mobs |

---

## 🔧 Mods Principais

- **Create** - Máquinas e automação
- **Iron's Spells 'n Spellbooks** - Sistema de magia
- **Deeper and Darker** - Expansão do Deep Dark
- **L_Ender's Cataclysm** - Bosses épicos
- **YUNG's Better Structures** - Estruturas aprimoradas
- **Oh The Biomes We've Gone** - Biomas diversos
- **FTB Quests** - Sistema de missões

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Contato

Encontrou um bug? Tem uma sugestão? Abra uma [Issue](../../issues)!

---

<p align="center">
  <i>""Vazio". Até onde ele vai tirar nossas vidas de nós? Até onde ele consegue consumir? Vai mesmo...existir um momento onde seremos livres?"</i><br>
  — Sunny Dantas
</p>
