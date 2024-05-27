"""Various utilities for interacting witht the MongoDB."""
import json
from pymongo import database
from pathlib import Path

def insert_from_file_to_collection(db: database.Database, collection_name: str, models_file_path: Path = Path(r"models.json")) -> None:
    """Insert data from dile into a given collection."""
    with open(models_file_path) as f:
        models_data = json.load(f)

    collection = db[collection_name]

    for model_object in models_data:
        collection.insert_one(model_object)


def init_db(db: database.Database, collection_name: str = "models") -> None:
    collection = db[collection_name]

    models_data = [{
    "name": "iris_nn",
    "output_types": [
      "string"
    ],
    "description": "Basic NN for predicitng iris species.",
    "url": "//127.0.0.1:8001",
    "args": [
      {
        "param_name": "SL",
        "type": "number"
      },
      {
        "param_name": "SW",
        "type": "number"
      },
      {
        "param_name": "PL",
        "type": "number"
      },
      {
        "param_name": "PW",
        "type": "number"
      }
    ]
  }]

    for model_object in models_data:
        collection.insert_one(model_object)
