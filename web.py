from flask import Flask, request, jsonify, stream_with_context, Response, render_template
import ollama
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

model = "llama3.1:8b"
messages = []
USER = "user"
ASSISTANT = "assistant"

def add_history(content, role):
    messages.append({'role': role, 'content': content})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    add_history(prompt, USER)
    response = ollama.chat(model, messages=messages, stream=True)

    def generate():
        complete_message = ""
        for chunk in response:
            part = chunk['message']['content']
            complete_message += part
            yield part
        add_history(complete_message, ASSISTANT)

    return Response(stream_with_context(generate()), content_type='text/plain')

@app.route('/history', methods=['GET'])
def get_history():
    return jsonify(messages)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)

