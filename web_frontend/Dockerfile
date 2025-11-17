# 1. ベースとなるOSとNode.jsの環境を選ぶ
FROM node:22-alpine

# 2. コンテナの中に作業用のフォルダを作る
WORKDIR /app

# 3. 最初にpackage.jsonだけをコピーして、効率よくライブラリをインストールする
COPY package*.json ./
RUN npm install

# 4. プロジェクトのすべてのファイルをコピーする
COPY . .

# 5. このコンテナは3000番ポートを使いますよ、と宣言する
EXPOSE 3000

# 6. コンテナが起動した時に、このコマンドを実行する
CMD ["npm", "run", "dev"]