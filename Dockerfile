FROM python:3.10

ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip install --upgrade pip 
RUN pip install -r requirements.txt

COPY xlimport .

# RUN python manage.py collectstatic --noinput for production

# CMD ["gunicorn", "xlimport.wsgi:application", "--bind", "0.0.0.0:8000"] for production