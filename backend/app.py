from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)

DATABASE_URL = "postgresql://admin:password@db:5432/tire_db"


def get_connection():
    return psycopg2.connect(DATABASE_URL)


@app.route("/api/tires", methods=["GET"])
def list_tires():
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, brand, model, size, quantity
                FROM tires
                ORDER BY id
                """
            )
            tires = cur.fetchall()
        return jsonify(tires), 200
    finally:
        conn.close()


@app.route("/api/tires/update-quantity", methods=["POST"])
def update_quantity():
    data = request.get_json(silent=True) or {}
    tire_id = data.get("id")
    delta = data.get("delta")

    if tire_id is None or delta is None:
        return jsonify({"error": "'id' and 'delta' are required"}), 400

    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                UPDATE tires
                SET quantity = GREATEST(quantity + %s, 0)
                WHERE id = %s
                RETURNING id, brand, model, size, quantity
                """,
                (delta, tire_id),
            )
            updated = cur.fetchone()

            if updated and updated["quantity"] == 0:
                cur.execute("DELETE FROM tires WHERE id = %s", (tire_id,))
                conn.commit()
                return jsonify({"id": tire_id, "deleted": True}), 200

        if updated is None:
            conn.rollback()
            return jsonify({"error": "Tire not found"}), 404

        conn.commit()
        return jsonify(updated), 200
    finally:
        conn.close()


@app.route("/api/tires/add", methods=["POST"])
def add_tire():
    data = request.get_json(silent=True) or {}

    brand = data.get("brand")
    model = data.get("model")
    size = data.get("size")
    quantity = data.get("quantity")

    if not brand or not model or not size or quantity is None:
        return jsonify({"error": "'brand', 'model', 'size', and 'quantity' are required"}), 400

    if not isinstance(quantity, int) or quantity <= 0:
        return jsonify({"error": "'quantity' must be a positive integer"}), 400

    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO tires (brand, model, size, quantity)
                VALUES (%s, %s, %s, %s)
                RETURNING id, brand, model, size, quantity
                """,
                (brand, model, size, quantity),
            )
            created = cur.fetchone()
        conn.commit()
        return jsonify(created), 201
    finally:
        conn.close()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
