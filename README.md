# Trosio API

**Project setup:**  
1. Run `git clone https://github.com/PetarIvancevic/trosio-api.git`.
2. Position into the project folder.
3. Run `npm install`.  

**Database setup:**  
Start a postgres instance with  
```
docker run --name trosio_db -e POSTGRES_USER=trosio -e POSTGRES_PASSWORD=trosio -p 6341:6341 -d postgres:10-alpine
```
You only have to do that once, in the future connect to the database with `docker run trosio_db`  

View the database with  
```
docker run -p 8081:8081 --link trosio_db:db -e DATABASE_URL=postgres://trosio:trosio@db:6341/trosio?sslmode=disable --rm sosedoff/pgweb 
```

To create the database run `npm run db:recreate`.
