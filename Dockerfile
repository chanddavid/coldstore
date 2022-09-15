FROM python:3
ENV PYTHONUNBUFFERED 1
WORKDIR /django-docker
COPY . /django-docker
RUN pip install requests
RUN pip install gunicorn
RUN pip install -r requirements.txt
