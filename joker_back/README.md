# build application

sudo docker-compose up --build

# run server

sudo docker-compose up

# run django commands on docker

sudo docker-compose exec joker-server python3 manage.py makemigrations
sudo docker-compose exec joker-server python3 manage.py migrate
sudo docker-compose exec joker-server python3 manage.py shell
