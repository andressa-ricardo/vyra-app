# Integração com o backend VYRA

## Contrato verificado

O backend foi inspecionado em `C:\Users\andre\Documents\vyra-be`. O cadastro está implementado por `AuthController`, `RegisterDto` e `AuthService`.

```http
POST /api/v1/auth/register
Content-Type: application/json
```

Payload:

```json
{
  "name": "Ana Silva",
  "email": "ana@example.com",
  "password": "Strong123"
}
```

Regras reais:

- `name`: string, 2 a 120 caracteres;
- `email`: e-mail válido, máximo de 254 caracteres;
- `password`: 8 a 128 caracteres, com ao menos uma letra maiúscula, uma minúscula e um número;
- campos extras são rejeitados pelo backend;
- `confirmPassword` existe somente no formulário mobile e não é enviado.

Resposta de sucesso HTTP 201:

```json
{
  "user": {
    "id": "uuid",
    "name": "Ana Silva",
    "email": "ana@example.com",
    "status": "ACTIVE",
    "emailVerifiedAt": null,
    "createdAt": "2026-10-30T00:00:00.000Z",
    "updatedAt": "2026-10-30T00:00:00.000Z",
    "roles": ["USER"]
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

Os tokens são salvos no Expo SecureStore e o usuário entra direto na home.

## Endpoints usados pelo app

| Método | Rota | Uso |
|---|---|---|
| POST | `/auth/register` | Cadastro (autentica em seguida) |
| POST | `/auth/login` | Login por e-mail e senha |
| POST | `/auth/refresh` | Rotação automática ao receber 401 |
| POST | `/auth/logout` | Revogar a sessão no logout |
| POST | `/auth/federated/google` | Login com Google (`idToken`) |
| POST | `/auth/federated/apple/nonce` | Nonce Apple de uso único |
| POST | `/auth/federated/apple` | Login com Apple (`identityToken` + nonce bruto) |
| GET | `/users/me` | Restaurar o usuário no startup |

## Configurar Google e Apple

Google não funciona no Expo Go. Para testar:

1. No Google Cloud Console, crie clientes OAuth Web, Android (package + SHA-1) e iOS (Bundle ID).
2. No app (`.env`): `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` e, para o build iOS, `GOOGLE_IOS_URL_SCHEME`.
3. No backend: `GOOGLE_OAUTH_ENABLED=true` e `GOOGLE_OAUTH_CLIENT_IDS` contendo **o client Web** (o ID token emitido pelo SDK tem o client Web como `aud`) e o client iOS.
4. Defina `android.package` e `ios.bundleIdentifier` em `app.json` e gere um development build com EAS.

Apple aparece apenas no iOS. No Expo Go o `aud` é o bundle do Expo Go, então a validação real exige build com o Bundle ID em `APPLE_ALLOWED_AUDIENCES`.

## Configurar o ambiente mobile

1. Copie o exemplo:

```powershell
Copy-Item .env.example .env
```

2. No computador que executará o backend, rode:

```powershell
ipconfig
```

3. Procure o adaptador Wi-Fi/Ethernet ativo e copie o valor **Endereço IPv4**, por exemplo `192.168.0.25`.

4. Configure o mobile sem incluir `/api/v1`:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.25:3000
```

O app acrescenta `/api/v1` automaticamente. Se a variável já terminar nesse prefixo, ele não é duplicado. Nunca coloque secrets, senhas ou tokens em uma variável `EXPO_PUBLIC_`.

Após alterar o `.env`, faça reload completo no Expo Go.

## Iniciar o backend

No repositório `vyra-be`, siga a configuração descrita no README do backend. Em um ambiente já preparado, normalmente:

```powershell
docker compose up -d postgres
npm run start:dev
```

O backend usa a porta `3000` por padrão e expõe Swagger em `http://localhost:3000/api/docs`. Esta task não executou migrations nem modificou o backend.

## Iniciar o aplicativo

No repositório `vyra-app`:

```powershell
npm install
npx expo start
```

Abra o QR code no Expo Go Android. Computador e celular devem estar na mesma rede local.

## Testar o cadastro

1. Confirme que PostgreSQL e backend estão ativos.
2. Confirme o `EXPO_PUBLIC_API_URL` com o IPv4 do computador.
3. Abra a rota inicial no Expo Go.
4. Preencha nome, e-mail, senha e confirmação.
5. Envie uma única vez e confira a mensagem de sucesso.
6. Use outro e-mail ao repetir um teste intencional.

Não use `localhost` no celular: nesse contexto ele aponta para o próprio Android. O túnel do Metro não publica automaticamente a API NestJS.

## Rede e firewall

- Celular e computador precisam alcançar um ao outro na rede local.
- O backend deve escutar em uma interface acessível pela rede. Se estiver limitado a loopback, ajuste sua inicialização de forma consciente no backend.
- O firewall do Windows pode precisar permitir conexões de entrada para o processo Node/porta 3000.
- Esta task não altera firewall nem configurações de segurança automaticamente.
- Redes corporativas ou com isolamento de clientes podem impedir a conexão mesmo com IP correto.

Uma verificação simples no navegador do celular é abrir `http://IP_DO_COMPUTADOR:3000/api/v1/health`.

## Tratamento de erros

O backend padroniza respostas com `statusCode`, `message`, `path` e `timestamp`, mas `message` pode ser string ou lista. O app não depende desse formato para mostrar textos.

Mapeamento atual:

| Situação | Mensagem exibida |
|---|---|
| Validação HTTP 400/422 | revisar dados |
| E-mail já cadastrado HTTP 409 | cadastro não pôde ser concluído com o e-mail |
| Limite HTTP 429 | aguardar antes de tentar |
| Sem resposta | verificar rede e URL |
| Timeout de 10 s | tentar novamente |
| HTTP 5xx | erro temporário do servidor |
| URL ausente/inválida | configurar API |
| Outro erro | mensagem genérica |

Nenhuma mensagem técnica ou stack trace é exibida.

## Limitações atuais

- O teste ponta a ponta depende do backend/banco em execução e não foi automatizado.
- Ainda não há botão de logout na interface.
- O backend descarta o campo `code` dos erros; o app trata todo 409 federado como e-mail já cadastrado.
- `isNewUser`/onboarding é ignorado até existir o fluxo de onboarding no app.
- O idioma manual não é persistido.
- HTTP local é apenas para desenvolvimento; produção deve usar HTTPS.
