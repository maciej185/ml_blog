from fastapi import FastAPI
from pydantic import BaseModel
from iris_model import model
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

ORIGINS = [
    "*",
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
]


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Iris(BaseModel):
    SL: float
    SW: float
    PL: float
    PW: float

@app.get("/")
def healthecheck():
    return "Health - OK"

@app.post('/')
def predict_iris(iris: Iris):
    
    data = np.array([[iris.SL, iris.SW, iris.PL, iris.PW]])
    species = ['Setosa', 'Versicolor', 'Virginica']
    
    prediction = model.predict(data)

    specie = species[np.argmax(prediction)]

    return specie

