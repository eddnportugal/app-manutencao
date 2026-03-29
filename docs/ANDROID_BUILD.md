# Guia de Geração do APK Android

Este guia explica como gerar o APK do App Manutenção para dispositivos Android.

## Pré-requisitos

### Software Necessário

1. **Android Studio** (versão mais recente)
   - Download: https://developer.android.com/studio
   
2. **Java JDK 17+**
   - Incluído no Android Studio ou instale separadamente

3. **Node.js 18+** e **pnpm 8+**
   - Download Node.js: https://nodejs.org
   - Instalar pnpm: `npm install -g pnpm`

### Configuração do Android Studio

1. Abra o Android Studio
2. Vá em **Tools > SDK Manager**
3. Instale:
   - Android SDK Platform 34 (ou mais recente)
   - Android SDK Build-Tools 34.0.0
   - Android SDK Command-line Tools

---

## Método 1: Build Local

### Passo 1: Clone o Repositório

```bash
git clone https://github.com/niggl1/manutencao-universal.git
cd manutencao-universal
```

### Passo 2: Instale as Dependências

```bash
pnpm install
```

### Passo 3: Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_APP_ID=seu-app-id
VITE_OAUTH_PORTAL_URL=https://sua-url-oauth
# ... outras variáveis necessárias
```

### Passo 4: Compile o Cliente Web

```bash
pnpm build:client
```

### Passo 5: Sincronize com Capacitor

```bash
npx cap sync android
```

### Passo 6: Abra no Android Studio

```bash
npx cap open android
```

### Passo 7: Gere o APK

No Android Studio:

1. Vá em **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Aguarde a compilação
3. O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Método 2: GitHub Actions (Automático)

### Configuração Inicial

1. Vá no repositório GitHub
2. Acesse **Settings > Secrets and variables > Actions**
3. Adicione os seguintes secrets:
   - `VITE_APP_ID`
   - `VITE_OAUTH_PORTAL_URL`
   - Outros secrets necessários

### Executar o Build

1. Vá na aba **Actions** do repositório
2. Selecione **Android Build**
3. Clique em **Run workflow**
4. Escolha o tipo de build (debug ou release)
5. Aguarde a conclusão
6. Baixe o APK em **Artifacts**

---

## Configurações do App

### Arquivo: `capacitor.config.ts`

```typescript
{
  appId: 'com.appmanutencao.app',  // ID único do app
  appName: 'App Manutenção',        // Nome exibido
  webDir: 'client/dist',            // Diretório do build web
}
```

### Personalização do Ícone

1. Substitua os ícones em:
   - `android/app/src/main/res/mipmap-*/ic_launcher.png`
   - `android/app/src/main/res/mipmap-*/ic_launcher_round.png`

2. Tamanhos necessários:
   | Pasta | Tamanho |
   |-------|---------|
   | mipmap-mdpi | 48x48 |
   | mipmap-hdpi | 72x72 |
   | mipmap-xhdpi | 96x96 |
   | mipmap-xxhdpi | 144x144 |
   | mipmap-xxxhdpi | 192x192 |

### Personalização da Splash Screen

Edite `capacitor.config.ts`:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: '#f97316',  // Cor de fundo
    // ...
  }
}
```

---

## Build de Produção (Release)

### Passo 1: Gere uma Keystore

```bash
keytool -genkey -v -keystore app-manutencao.keystore -alias app-manutencao -keyalg RSA -keysize 2048 -validity 10000
```

### Passo 2: Configure a Assinatura

Edite `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('app-manutencao.keystore')
            storePassword 'sua-senha'
            keyAlias 'app-manutencao'
            keyPassword 'sua-senha'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Passo 3: Gere o APK Release

No Android Studio:
- **Build > Generate Signed Bundle / APK**
- Selecione APK
- Escolha a keystore
- Selecione release
- Finalize

---

## Solução de Problemas

### Erro: "SDK location not found"

Crie o arquivo `android/local.properties`:
```
sdk.dir=/caminho/para/Android/Sdk
```

### Erro: "Gradle build failed"

```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### Erro: "JAVA_HOME not set"

Configure a variável de ambiente JAVA_HOME apontando para o JDK.

---

## Publicação na Play Store

1. Gere um APK ou AAB assinado (release)
2. Acesse o [Google Play Console](https://play.google.com/console)
3. Crie um novo app
4. Faça upload do APK/AAB
5. Preencha as informações do app
6. Envie para revisão

---

## Suporte

Em caso de dúvidas, abra uma issue no repositório GitHub.
