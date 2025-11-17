# ----- ステージ1: ビルド環境 (SDKを使ってアプリを組み立てる作業場) -----
# .NET 9 SDKを含むOSを土台にする
# /srcフォルダを作業用フォルダとして作成
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build-env
WORKDIR /src

# まずプロジェクトファイルだけをコピーして、ライブラリを復元する
# (ソースコードの変更だけでは、ここの再実行が不要になりビルドが速くなる)
COPY *.csproj ./
RUN dotnet restore

# プロジェクトの全てのファイルをコピーして、ビルド&発行する
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# ----- ステージ2: 実行環境 (完成品を動かすためだけの最小限の環境) -----
# .NET 9 の実行環境(ランタイム)だけを含む小さなOSを土台にする
# /appフォルダを作業用フォルダとして作成
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# ステージ1の作業場から、発行された完成品だけをコピーしてくる
COPY --from=build-env /app/publish .

# このコンテナは80番ポートを使いますよ、と宣言する
EXPOSE 80

# コンテナが起動した時に、このコマンドを実行してアプリを動かす
ENTRYPOINT ["dotnet", "web_backend.dll"]