# Instructions

1. Clone the repository
```bash
git clone https://github.com/yeguezn/tienda.git
```
2. Get into the repository and install dependencies
```bash
cd ecommere-api && npm install
```
3. Rename the .env.example file to .env

4. Run migrations
```bash
node ace migration:run
```
5. Run seeders to generate an admin employee to operate the api
```bash
node ace db:seed
```

# Admin credentials
1. email: admin@gmail.com
2. password: 12345678

# DB ER diagram

![title](/ecommerce.png)