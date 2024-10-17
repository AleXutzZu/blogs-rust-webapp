FROM ubuntu:latest
LABEL authors="alexutzzu"

ENTRYPOINT ["top", "-b"]