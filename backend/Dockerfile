FROM python:latest

WORKDIR /baackend

COPY . /baackend

RUN apt-get update --fix-missing
RUN apt-get install -y libgl1-mesa-glx
RUN apt-get install -y libglib2.0-0 git

RUN pip install -r requirements.txt

CMD uvicorn main:app --reload --host 0.0.0.0

# docker build -t backend .
# docker run -it -p 8000:8000 -v ./:/workspace backend