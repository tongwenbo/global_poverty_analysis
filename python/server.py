from flask import Flask, Response, jsonify
import pandas as pd
import sqlite3

app = Flask(__name__)
app.config["DEBUG"] = True

@app.route("/api/v1/map", methods=["GET"])
def map():
    connection = sqlite3.connect("./data.db")
    df = pd.read_sql('''
            SELECT * FROM map
        ''', con=connection)
    connection.close()
    return Response(
        response=df.to_csv(),
        headers={"Access-Control-Allow-Origin": "*"}
    )

@app.route("/api/v1/line", methods=["GET"])
def line():
    connection = sqlite3.connect("./data.db")
    df = pd.read_sql('''
            SELECT * FROM line
        ''', con=connection)
    connection.close()
    return Response(
        response=df.to_csv(),
        headers={"Access-Control-Allow-Origin": "*"}
    )

@app.route("/api/v1/umap", methods=["GET"])
def umap():
    connection = sqlite3.connect("./data.db")
    df = pd.read_sql('''
            SELECT * FROM umap
        ''', con=connection)
    connection.close()
    return Response(
        response=df.to_csv(),
        headers={"Access-Control-Allow-Origin": "*"}
    )

@app.route("/api/v1/mds", methods=["GET"])
def mds():
    connection = sqlite3.connect("./data.db")
    df = pd.read_sql('''
            SELECT * FROM mds
        ''', con=connection)
    connection.close()
    return Response(
        response=df.to_csv(),
        headers={"Access-Control-Allow-Origin": "*"}
    )

app.run(port=8080)