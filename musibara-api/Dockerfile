FROM python:3.12.6
RUN apt-get update
RUN apt-get install build-essential -y --no-install-recommends
WORKDIR /code
COPY . /code
CMD ["make", "clean"]
CMD ["make"]
