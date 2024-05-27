FROM python:3.9
ENV PYTHONUNBUFFERED 1
COPY . .
RUN pip install -r requirements.txt
CMD uvicorn model_api:app --host 0.0.0.0 --port 8009 --reload