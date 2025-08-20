# Sincronizar cambios de API al repositorio `bisonte-api`

Siempre que modifiques código de backend (carpeta `backend-api/`), los cambios deben ser comiteados y empujados al repo separado `bisonte-api`.

## Requisitos
- `backend-api/` ya tiene su propio `.git` con remoto configurado a `origin` del repo `bisonte-api`.

## Comandos rápidos
- Ver estado:
```
npm run api:status
```
- Commit + push manual:
```
npm run api:commit
npm run api:push
```
- Sync en una sola instrucción (commit si hay cambios + push):
```
npm run api:sync
```
- Sync asistido (script Node):
```
npm run api:sync:auto
```

Si no tienes configurado el remoto, entra a `backend-api/` y agrega:
```
cd backend-api
git remote add origin <git@github.com:tu-org/bisonte-api.git>
```

## Comandos para `api-server/`
- Ver estado:
```
npm run apisrv:status
```
- Commit + push manual:
```
npm run apisrv:commit
npm run apisrv:push
```
- Sync en una sola instrucción:
```
npm run apisrv:sync
```
- Sync asistido (script Node):
```
npm run apisrv:sync:auto
```
Configura el remoto si falta:
```
cd api-server
git remote add origin <git@github.com:tu-org/bisonte-api.git>
```
