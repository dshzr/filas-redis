# filas-redis

API em Express que enfileira envios de e-mail no Redis com [BullMQ](https://docs.bullmq.io/) e os processa num worker que sobe junto com o servidor.

O envio de e-mail é simulado: o worker espera 1 segundo e devolve o horário. Troque o corpo do processador em `src/worker.ts` pela integração real.

## Requisitos

- Node.js 22.18 ou mais novo. Os arquivos `.ts` rodam direto no Node, sem etapa de build.
- Um Redis acessível (local ou gerenciado, como o Redis Cloud).

## Como rodar

```bash
npm install
cp .env.example .env   # preencha REDIS_URL
npm run dev
```

O servidor sobe em `http://localhost:3000` e o worker começa a escutar a fila `email`.

### Variáveis de ambiente

| Variável    | Descrição                          | Padrão |
| ----------- | ---------------------------------- | ------ |
| `REDIS_URL` | URL de conexão do Redis            | —      |
| `PORT`      | Porta HTTP da API                  | `3000` |

## Rotas

### `POST /jobs/email`

Adiciona um job de envio na fila.

```bash
curl -X POST localhost:3000/jobs/email \
  -H 'content-type: application/json' \
  -d '{"to":"fulano@exemplo.com","subject":"Oi","body":"Olá!"}'
```

A resposta traz o `jobId`, usado para consultar o andamento.

### `GET /jobs/:id`

Consulta um job. Devolve 404 se o id não existir.

```json
{
  "id": "20",
  "name": "sendEmail",
  "status": "completed",
  "data": { "to": "fulano@exemplo.com", "subject": "Oi", "body": "Olá!" },
  "result": { "sentAt": "2026-10-31T00:03:08.607Z" },
  "attempts": 1,
  "createdAt": "2026-10-31T00:03:07.119Z",
  "finishedAt": "2026-10-31T00:03:08.607Z"
}
```

`status` pode ser `waiting`, `active`, `completed`, `failed` ou `delayed`. Quando o job falha, aparece também `failedReason`.

## Estrutura

- `src/index.js`: servidor Express e rotas; chama `startWorker()` ao subir.
- `src/queue.ts`: definição da fila `email` e do tipo dos dados do job.
- `src/worker.ts`: `startWorker()`, que processa os jobs da fila.
- `src/connection.ts`: carrega o `.env` e monta a conexão com o Redis.

## Cuidado com a política de descarte do Redis

O BullMQ avisa no console quando a política de descarte (`maxmemory-policy`) não é `noeviction`. Com outra política, o Redis pode apagar jobs quando a memória enche. No Redis local, rode `redis-cli CONFIG SET maxmemory-policy noeviction`. No Redis Cloud, mude o campo "Data eviction policy" na configuração do banco.
