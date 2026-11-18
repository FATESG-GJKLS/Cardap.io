# 🍴 Caradap.io

> **Aquele prato de sempre e aquele prato que você nem sabia que queria provar.**

Projeto acadêmico **N2 – Testes de Software (FATESG, 2026/02)**. Aplicativo de delivery com interface original inspirada nos padrões de cardápios do MenuDino e no estilo de hamburgueria/delivery do Anota.ai. Não usa logotipos, textos ou identidade visual proprietária dessas marcas.

## Integrantes

- Guilherme Augusto
- Jose Roberto
- Karina Aparecida
- Sara Alves

## Video preview
<video controls src=".docs/n2-testes-video.mp4" title="Title"></video>

## O que é

O **Caradap.io** é uma loja digital de comida com um diferencial simples: **vendemos de tudo**, dos populares smash burgers, pizzas, PFs e coxinhas às receitas menos convencionais, como burger de jacaré, takoyaki e curry tailandês. As ofertas são **fictícias e demonstrativas**, para finalidade educacional.

### Funcionalidades do sistema

- Catálogo com 21 produtos e 8 categorias, com fotos ilustrativas, busca, filtro por categoria e destaque de pratos exóticos.
- Carrinho com adição/remoção, quantidade, subtotal e frete grátis a partir de R$ 80.
- Checkout com endereço, observações, escolha da forma de pagamento (**simulação sem cobrança real**), pedido e histórico.
- Cadastro de conta, login com senha criptografada (BCrypt), sessão por token JWT assinado, edição de perfil e logout.
- Painel administrativo para **CRUD de Produto**, **CRUD de Categoria** e **CRUD de Usuário**, além da visualização e atualização do status dos pedidos.
- Layout responsivo para **Android, iOS e navegador** com Expo/React Native Web.
- Preview demonstrativo do catálogo caso a API esteja offline (somente navegação e carrinho; login/checkout exigem API).

## Tecnologias e arquitetura

| Camada | Stack |
|---|---|
| Mobile / Web | Expo SDK 54, React Native, TypeScript, React Native Web |
| Back-end | Java 17, Spring Boot 3.5, Spring Web, Spring Security, Spring Data JPA |
| Persistência relacional | H2 **persistente em disco** (substituível por PostgreSQL) |
| Autenticação | BCrypt + JWT HMAC-SHA256 de 24 horas |
| Unitários | JUnit 5 |
| API | REST-assured |
| E2E | Selenium WebDriver + Chrome headless no Expo Web |
| CI | GitHub Actions |

**Arquitetura**: `Expo (iOS/Android/Web) → HTTP/JSON → API Spring Boot → JPA → banco H2 persistido`.

O servidor nunca aceita preços informados pelo aplicativo; ele recalcula todos os itens com base no banco. As rotas de escrita de produtos, categorias, usuários e o status dos pedidos exigem papel `ADMIN`.

## Estrutura de pastas

```text
caradap-io/
├── mobile/                  # Expo: App.tsx e código TypeScript
│   ├── App.tsx
│   ├── src/{api,demo,types}.ts
│   ├── src/components/      # Componentes visuais reutilizáveis
│   ├── src/screens/         # Views de autenticação, carrinho, checkout e perfil
│   └── app.json
├── api/                     # Spring Boot
│   ├── src/main/java/io/caradap/api/
│   │   ├── config/          # Seed de demonstração, CORS e segurança
│   │   ├── controller/      # REST endpoints
│   │   ├── dto/             # Contratos de API
│   │   ├── entity/          # Entidades JPA
│   │   ├── repo/            # Repositórios relacionais
│   │   ├── security/        # JWT e filtro de autenticação
│   │   └── service/         # Regras de preço e frete
│   └── src/test/java/...    # JUnit, REST-assured e Selenium
├── iniciar-api.bat          # Inicia a API localmente no Windows
├── iniciar-web.bat          # Inicia o Expo Web no Windows
├── iniciar-api.sh           # Inicia a API no Linux/macOS
├── iniciar-web.sh           # Inicia o Expo Web no Linux/macOS
└── .github/workflows/       # CI dos testes
```

## Iniciar o projeto localmente — SEM DOCKER

O Caradap.io roda **100% no seu computador**. **Não é necessário Docker, PostgreSQL nem servidor hospedado**: a API Spring Boot cria automaticamente um banco relacional H2 em arquivo, dentro de `api/data/`. Esse banco preserva os dados mesmo quando você encerra o servidor.

### Pré-requisitos

- **Java JDK 17 ou superior** (`java -version`)
- **Apache Maven 3.9 ou superior** (`mvn -version`)
- **Node.js 20.19+ ou 22+ e npm** (`node -v` e `npm -v`)
- Para usar a versão web e o Selenium, um navegador **Google Chrome/Chromium**; para testar no celular, **Expo Go** e Wi-Fi local

As dependências npm e Maven são baixadas uma vez na primeira execução. Depois de instaladas, o servidor, o banco e a interface rodam localmente; fotos externas do catálogo requerem internet.

### Opção A: Windows — iniciar com dois cliques

Extraia o ZIP para uma pasta normal do Windows (ex.: `C:\Projetos\caradap-io-sem-docker`). Abra **dois terminais**, ou dê dois cliques nos arquivos da raiz:

1. **`iniciar-api.bat`** — inicia a API Spring Boot em `http://localhost:8080`.
2. **`iniciar-web.bat`** — instala as dependências do Expo, se necessário, e inicia o site em `http://localhost:8081`.

Aguarde as duas janelas indicarem que os serviços estão prontos; deixe-as abertas enquanto usa o sistema.

**Equivalente no PowerShell ou CMD (terminal 1):**

```powershell
cd api
mvn spring-boot:run
```

**Em outro terminal (terminal 2, começando na raiz):**

```powershell
cd mobile
npm install
npm run web
```

### Opção B: Linux/macOS — sem Docker

No primeiro terminal, na raiz do projeto:

```bash
./iniciar-api.sh
```

No segundo terminal:

```bash
./iniciar-web.sh
```

Se a execução de scripts não estiver permitida, use `bash iniciar-api.sh` e `bash iniciar-web.sh`.

### Verificar o funcionamento

- **API:** <http://localhost:8080/api/health> — deve responder com `"status":"ok"`.
- **Aplicativo web:** <http://localhost:8081>.
- **Banco de dados:** arquivos criados automaticamente em `api/data/` (não apague para conservar contas e pedidos).

Se a porta `8080` ou `8081` já estiver em uso, encerre o processo antigo antes de iniciar o Caradap.io. Não abra o projeto direto por `file://`: use sempre o Expo.

### Executar no celular usando Expo Go (opcional)

No terminal, entre em `mobile` e use `npm start` para exibir o QR Code. Para que o aplicativo do celular acesse a API do computador, é necessário apontá-lo para o **IP IPv4 local do PC**, e não para `localhost`.

1. No Windows, rode `ipconfig` e localize o **Endereço IPv4** da conexão Wi-Fi, por exemplo `192.168.1.100`.
2. Crie `mobile/.env` com a linha `EXPO_PUBLIC_API_URL=http://192.168.1.100:8080` (troque pelo IP real).
3. Reinicie o Expo com `npx expo start -c` e escaneie o QR Code no Expo Go.
4. PC e celular devem usar a mesma rede Wi-Fi. Se necessário, permita a porta **8080** no firewall do Windows.

No **emulador Android**, a API padrão utiliza `http://10.0.2.2:8080`. Para a **versão web no mesmo computador**, o padrão é `http://localhost:8080`; normalmente não é preciso configurar `.env`.

### Configurações locais da API

O arquivo `api/src/main/resources/application.properties` já configura Java/Spring, H2 e a porta 8080. Não é preciso criar arquivo `.env` para iniciar a API. O Spring Boot **não lê automaticamente** um `.env` na raiz; para alterar senhas ou configurações, forneça variáveis de ambiente no terminal **antes** de executar `mvn spring-boot:run`, por exemplo:

```powershell
$env:ADMIN_PASSWORD="UmaSenhaLocalForte"
$env:JWT_SECRET="um-segredo-longo-com-pelo-menos-32-caracteres"
cd api
mvn spring-boot:run
```

O H2 em disco é um **banco relacional**, atendendo ao requisito de persistência da N2. Nenhuma mudança é necessária nos CRUDs, na API ou nos testes por usar o banco local.

### 3. Login administrativo de desenvolvimento

- **E-mail:** `admin@caradap.io`
- **Senha:** `Admin@12345`

Entre em **Conta → Painel administrativo** para gerenciar os três CRUDs e acompanhar pedidos. Esses dados são **apenas para o ambiente local**: altere as variáveis `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `JWT_SECRET` antes de fazer qualquer implantação pública. O admin é semeado somente se ainda não existir.

O cadastro público cria contas com perfil `CUSTOMER` e **não aceita** tornar alguém administrador.

## Endpoints REST

| Método | Rota | Função | Permissão |
|---|---|---|---|
| GET | `/api/health` | Disponibilidade | Público |
| POST | `/api/auth/register` | Cadastro de cliente | Público |
| POST | `/api/auth/login` | Autenticação | Público |
| GET, POST | `/api/categories` | Listar / criar categorias | GET público, POST admin |
| GET, PUT, DELETE | `/api/categories/{id}` | Ler / editar / excluir | GET público, demais admin |
| GET, POST | `/api/products` | Buscar / criar produtos | GET público, POST admin |
| GET, PUT, DELETE | `/api/products/{id}` | Ler / editar / excluir | GET público, demais admin |
| GET, POST | `/api/users` | Listar / criar usuários | Admin |
| GET, PUT, DELETE | `/api/users/{id}` | Ler / editar / excluir usuários | Admin |
| GET, PUT | `/api/users/me` | Dados e edição do perfil | Autenticado |
| POST | `/api/orders` | Criar pedido com preços do servidor | Autenticado |
| GET | `/api/orders/mine` | Meus pedidos | Autenticado |
| GET | `/api/orders` | Pedidos de todos os clientes | Admin |
| PATCH | `/api/orders/{id}/status` | Alterar status | Admin |

**Observação:** categorias com produtos vinculados, produtos já utilizados em pedidos e contas com pedidos não podem ser excluídos (retornam `409 Conflict`). Isso preserva a integridade relacional.

### Exemplo: consultar produtos

```bash
curl http://localhost:8080/api/products
```

### Exemplo: autenticação

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@caradap.io","password":"Admin@12345"}'
```

Copie o token retornado e utilize `Authorization: Bearer SEU_TOKEN` nas operações protegidas.

## Testes automatizados exigidos na N2

| Nível | Framework | Casos incluídos | Comando |
|---|---|---|---|
| Unitários | JUnit 5 | **4**: total de itens, frete grátis, quantidade inválida, cálculo do total | `cd api && mvn test` |
| API | REST-assured | **7**: catálogo, controle de acesso, cadastro/login, preço recalculado e CRUD de produto, categoria e usuário | `cd api && mvn test` |
| E2E | Selenium WebDriver | **2**: buscar/adicionar ao carrinho; cadastrar cliente pelo Expo Web | `cd api && mvn test -Pe2e` |

**Para o Selenium:** inicie API (`localhost:8080`) e Expo Web (`localhost:8081`) antes de `mvn test -Pe2e`. O Chrome/Chromium deve estar instalado. Opcionalmente use `-Dweb.base=http://localhost:8081` se necessário. A suíte E2E roda separadamente da suíte regular.

A pipeline em `.github/workflows/tests.yml` executa os testes em cada push/PR e inicia API/Expo para os cenários Selenium. Se o runner não localizar o Chrome, configure `ChromeDriver` e o navegador do ambiente.

## Correspondência com a avaliação N2

| Critério do PDF | Implementação |
|---|---|
| Sistema completo de vendas | Carrinho, checkout, pedidos e histórico |
| Dois CRUDs de entidades distintas, cada um com 5+ atributos | **Produto** (nome, descrição, preço, categoria, imagem, flags, tempo etc.) e **Categoria** (nome, slug, emoji, descrição, ordem, ativo) |
| CRUD de usuário e login funcional | `AppUser` com id, nome, e-mail, hash, papel, data de criação + UI de login e administração |
| Cliente-servidor | Expo consome REST API Spring Boot |
| Banco relacional | H2 com JPA, persistência física |
| ≥ 3 JUnit | 4 testes |
| ≥ 2 Selenium | 2 testes |
| ≥ 2 REST-assured | 7 testes |
| GitHub público | Publicar este repositório |
| Vídeo de até 5 minutos | Gravar conforme roteiro abaixo |

### Roteiro sugerido para o vídeo (até 5 minutos)

1. Mostrar a home, categorias comuns e exóticas, e pesquisar por um produto.
2. Adicionar pratos ao carrinho, cadastrar/login e concluir pedido demonstrativo.
3. Acessar painel como admin e criar/editar/excluir um produto e uma categoria (sem produtos relacionados); mostrar gerenciamento de usuários.
4. Abrir histórico e alterar status do pedido no painel.
5. Mostrar saída de `mvn test` (JUnit/REST-assured) e `mvn test -Pe2e` (Selenium).

### Referências de estética e UX

- [MenuDino Goiânia](https://menudino.com/delivery/goiania-go?origem=homemenudino): categorias, descoberta de pratos e linguagem direta de marketplace.
- [Behest Burger — Anota AI](https://pedido.anota.ai/loja/behestburger): pedido rápido, identidade forte de hamburgueria e destaque de produtos.

Projeto **original** de demonstração, sem vínculo comercial com os sites citados.
