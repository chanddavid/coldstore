FROM python:3.8
ENV PYTHONUNBUFFERED 1
WORKDIR /django-docker
COPY requirements.txt /django-docker/
RUN pip install -r requirements.txt
