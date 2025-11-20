FROM node:18 AS frontend
WORKDIR /app
COPY client_app/ ./
RUN npm install
RUN npm run build

FROM python:3.12

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY --from=frontend /app/build/index.html /app/templates/index.html
COPY --from=frontend /app/build/static /app/static/
COPY --from=frontend /app/build/vite.svg /app/static/


RUN python manage.py collectstatic

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "t_and_p_automation.wsgi:application", "--bind", "0.0.0.0:8000"]