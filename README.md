# P2P Price Pulse 📡💰

> **A pulsação do mercado, direto da mão de quem compra.**

O **P2P Price Pulse** é uma aplicação descentralizada (dApp) mobile-first projetada para capacitar consumidores através da transparência de preços. Em vez de depender de bases de dados centralizadas ou APIs corporativas, o app utiliza uma rede **Peer-to-Peer (P2P)** para sincronizar preços reais observados pela comunidade em tempo real.

---

## 🚀 Funcionalidades Principais

- **🔍 Scanner Híbrido:** Escaneie códigos de barras (EAN-13/8) para consultar preços ou QR Codes de Notas Fiscais (NFC-e) para alimentar a rede.
- **📑 Extração de Dados NFC-e:** Através de um proxy seguro, o app extrai automaticamente itens e preços verificados diretamente dos portais da SEFAZ.
- **🌐 Rede Descentralizada (GunDB):** Os dados são armazenados e sincronizados via protocolo graph descentralizado, garantindo que a informação não pertença a uma única empresa.
- **🛒 Lista de Compras Inteligente:** Monte sua lista, ajuste preços manualmente conforme a realidade da prateleira e veja seu orçamento total instantaneamente.
- **📊 Algoritmo de Consenso:** Cálculo inteligente de preço médio ignorando *outliers* (valores falsos ou errôneos) para fornecer uma estimativa confiável.
- **📶 Modo Offline:** Continue gerenciando sua lista e escaneando produtos mesmo sem internet; os dados sincronizam assim que a conexão retornar.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Banco de Dados P2P:** [GunDB](https://gun.eco/)
- **Scraping de Notas:** [Cheerio](https://cheerio.js.org/) (Server Actions)
- **Scanner Óptico:** [HTML5-QRCode](https://github.com/mebjas/html5-qrcode)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## 🏗️ Arquitetura e Fluxo

### 1. Colaboração Orgânica
Cada vez que você ajusta um preço na sua lista de compras ou escaneia uma nota fiscal, você está "minerando" dados de utilidade pública. O sistema envia esses pontos de preço anonimamente para a rede.

### 2. Validação de Dados
O app diferencia dados **Verificados** (vindos de Notas Fiscais) de dados **Observados** (inserções manuais). Isso permite que o algoritmo de consenso dê pesos diferentes à confiabilidade da informação.

### 3. Privacidade Total
Não é necessário login. O app gera um ID de dispositivo único e anônimo para cada usuário, protegendo sua identidade enquanto você contribui para a rede.

---

## 🏁 Como Começar

### Pré-requisitos
- Node.js 18 ou superior.

### Instalação
1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:9002` no seu navegador (preferencialmente em modo de visualização mobile).

---

## 🤝 Contribuição

Este é um projeto de código aberto voltado para o benefício social. Se você deseja ajudar a combater a assimetria de informação nos mercados, sinta-se à vontade para abrir Issues ou enviar Pull Requests.

---

## 📜 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---
*Desenvolvido com foco em descentralização e empoderamento do consumidor.*