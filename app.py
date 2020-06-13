from datetime import datetime
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

CHANNELS = [{
    "id": 0,
    "name": "general",
    "messages": []
}]
UID = 0


@app.route("/")
def index():
    return render_template("index.html", channels=CHANNELS)


@app.route("/<int:channel_id>")
def channel(channel_id):
    if channel_id >= len(CHANNELS):
        channel_id = 0
    return render_template(
        "index.html",
        channels=CHANNELS,
        channel_id=channel_id
    )


@app.route("/check")
def check():
    channel_name = request.args.get("channel_name")

    if (
        not channel_name or
        channel_name and any(
            channel['name'] == channel_name
            for channel in CHANNELS
        )
    ):
        return jsonify(False)

    return jsonify(True)


@app.route("/get_messages", methods=["POST"])
def get_messages():
    channel_id = request.form.get("channel_id")
    start = request.form.get("start")
    end = request.form.get("end")

    if (
        not channel_id or
        not channel_id.isdigit() or
        int(channel_id) >= len(CHANNELS) or
        not start.isdigit() or
        int(start) > len(CHANNELS[int(channel_id)]['messages']) or
        not end.isdigit()
    ):
        return jsonify(False)

    start = int(start) * -1
    if int(start) == 0:
        start = None

    first = False
    messages = CHANNELS[int(channel_id)]['messages']
    if int(end) >= len(messages):
        first = True
        messages = messages[start::-1]
    else:
        end = int(end) * -1
        messages = messages[start:end:-1]

    return jsonify({
        "first": first,
        "messages": messages
    })


@socketio.on("create channel")
def create_channel(data):
    channel_name = data.get("channel_name")

    if not channel_name:
        return

    channel = {
        "id": len(CHANNELS),
        "name": channel_name,
        "messages": []
    }
    CHANNELS.append(channel)
    emit("channel created", {"channel": channel}, broadcast=True)


@socketio.on("send message")
def send_message(data):
    channel_id = data.get("channel_id")
    display_name = data.get("display_name")
    text = data.get("text")

    if (
        not channel_id or
        not channel_id.isdigit() or
        int(channel_id) >= len(CHANNELS) or
        not display_name or
        not text
    ):
        return

    global UID
    now = datetime.now().strftime("%b %d, %Y at %I:%M %p")
    message = {
        "id": UID,
        "display_name": display_name,
        "timestamp": now,
        "text": text
    }
    UID += 1
    messages = CHANNELS[int(channel_id)]['messages']
    messages.append(message)

    while len(messages) >= 100:
        messages.pop(0)

    emit(
        "message sent",
        {
            "channel_id": channel_id,
            "message": message
        },
        broadcast=True
    )


@socketio.on("delete message")
def delete_message(data):
    channel_id = data.get("channel_id")
    message_id = data.get("message_id")

    if (
        not channel_id or
        not channel_id.isdigit() or
        int(channel_id) >= len(CHANNELS) or
        not message_id or
        not message_id.isdigit() or
        int(message_id) >= UID
    ):
        return

    CHANNELS[int(channel_id)]['messages'] = [
        message for message
        in CHANNELS[int(channel_id)]['messages']
        if not message['id'] == int(message_id)
    ]

    emit(
        "message deleted",
        {
            "channel_id": channel_id,
            "message_id": message_id
        },
        broadcast=True
    )


if __name__ == '__main__':
    socketio.run(app, debug=True)
