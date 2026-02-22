from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import csv
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

load_dotenv()

# Config
PATH = "all excels/"

# Ensure directories exist
os.makedirs(PATH, exist_ok=True)
os.makedirs("logs", exist_ok=True)


def read_config_file(filename):
    """Read a config file and return its variables as a dict"""
    config = {}
    filepath = f"config/{filename}"

    if not os.path.exists(filepath):
        return config

    try:
        # Use importlib to properly parse the Python file
        import importlib.util

        spec = importlib.util.spec_from_file_location("config_module", filepath)
        if spec and spec.loader:
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)

            # Get all non-private attributes
            for attr in dir(module):
                if not attr.startswith("_"):
                    value = getattr(module, attr)
                    if not callable(value):
                        config[attr] = value
    except Exception as e:
        print(f"Error reading {filename}: {e}")

    return config

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Parse manually - handle multiline strings
    import re

    # Find all variable assignments - handle multiline strings
    lines = content.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Skip empty lines, comments, and docstrings
        if (
            not line
            or line.startswith("#")
            or line.startswith("'''")
            or line.startswith('"""')
        ):
            i += 1
            continue

        # Check for variable assignment
        if "=" in line:
            parts = line.split("=", 1)
            key = parts[0].strip()
            value_part = parts[1].strip()

            if key and value_part:
                # Handle different types
                if value_part.startswith("[") and value_str.endswith("]"):
                    # List - find the end
                    pass
                elif value_part.lower() in ("true", "false"):
                    config[key] = value_part.lower() == "true"
                elif value_part.isdigit():
                    config[key] = int(value_part)
                elif value_part.startswith('"') or value_part.startswith("'"):
                    # String - could be multiline
                    quote = value_part[0]
                    if value_part.count(quote) >= 2 and value_part.endswith(quote):
                        # Single line string
                        config[key] = value_part[1:-1]
                    else:
                        # Multi-line string - collect all lines until closing quote
                        result = value_part[1:] if len(value_part) > 1 else ""
                        i += 1
                        while i < len(lines):
                            if quote in lines[i]:
                                result += "\n" + lines[i].split(quote)[0]
                                break
                            result += "\n" + lines[i]
                            i += 1
                        config[key] = result
                else:
                    config[key] = value_part

        i += 1

    return config

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Parse the content manually to handle quotes properly
    import re

    # Find all variable assignments: key = value
    # Handle strings with single or double quotes, and lists
    pattern = r"^(\w+)\s*=\s*(.+?)$"

    for line in content.split("\n"):
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("'''"):
            continue

        match = re.match(pattern, line, re.MULTILINE)
        if match:
            key = match.group(1)
            value_str = match.group(2).strip()

            # Handle different value types
            if value_str.startswith("[") and value_str.endswith("]"):
                # It's a list
                try:
                    value = eval(value_str)
                except:
                    value = []
            elif value_str.lower() in ("true", "false"):
                value = value_str.lower() == "true"
            elif value_str.isdigit():
                value = int(value_str)
            elif value_str.startswith('"') and value_str.endswith('"'):
                value = value_str[1:-1]
            elif value_str.startswith("'") and value_str.endswith("'"):
                value = value_str[1:-1]
            else:
                value = value_str

            config[key] = value

    return config


def save_config_file(config_dict, filename):
    """Save config dict to file"""
    filepath = f"config/{filename}"

    with open(filepath, "w", encoding="utf-8") as f:
        f.write("'''\nAuthor: Generated by UI\n'''\n\n")
        for key, value in config_dict.items():
            if isinstance(value, bool):
                f.write(f"{key} = {str(value)}\n")
            elif isinstance(value, int):
                f.write(f"{key} = {value}\n")
            elif isinstance(value, list):
                f.write(f"{key} = {value}\n")
            elif isinstance(value, str):
                if "\n" in value or len(value) > 100:
                    # Multi-line or long string - use triple quotes
                    f.write(f'{key} = """{value}"""\n')
                else:
                    # Simple string
                    f.write(f'{key} = "{value}"\n')
            else:
                f.write(f'{key} = "{value}"\n')


# Load configs
personals = read_config_file("personals.py")
search_mod = read_config_file("search.py")
secrets_mod = read_config_file("secrets.py")
settings_mod = read_config_file("settings.py")
questions_mod = read_config_file("questions.py")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/applied-jobs", methods=["GET"])
def get_applied_jobs():
    try:
        jobs = []
        csv_path = PATH + "all_applied_applications_history.csv"
        if not os.path.exists(csv_path):
            return jsonify([])

        with open(csv_path, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            for row in reader:
                jobs.append(
                    {
                        "Job_ID": row.get("Job ID", ""),
                        "Title": row.get("Title", ""),
                        "Company": row.get("Company", ""),
                        "Work_Location": row.get("Work Location", ""),
                        "Work_Style": row.get("Work Style", ""),
                        "Date_Applied": row.get("Date Applied", ""),
                        "Job_Link": row.get("Job Link", ""),
                        "External_Job_link": row.get("External Job link", ""),
                    }
                )
        return jsonify(jobs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/failed-jobs", methods=["GET"])
def get_failed_jobs():
    try:
        jobs = []
        csv_path = PATH + "all_failed_applications_history.csv"
        if not os.path.exists(csv_path):
            return jsonify([])

        with open(csv_path, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            for row in reader:
                jobs.append(
                    {
                        "Job_ID": row.get("Job ID", ""),
                        "Title": row.get("Title", ""),
                        "Company": row.get("Company", ""),
                        "Job_Link": row.get("Job Link", ""),
                    }
                )
        return jsonify(jobs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/config/personals", methods=["GET", "POST"])
def config_personals():
    global personals
    if request.method == "GET":
        return jsonify(personals)

    data = request.json
    personals.update(data)
    save_config_file(personals, "personals.py")
    return jsonify({"success": True})


@app.route("/config/search", methods=["GET", "POST"])
def config_search():
    global search_mod
    if request.method == "GET":
        return jsonify(search_mod)

    data = request.json
    # Ensure search_terms has at least one item
    if not data.get("search_terms") or len(data["search_terms"]) == 0:
        data["search_terms"] = ["Software Engineer"]

    search_mod.update(data)
    save_config_file(search_mod, "search.py")
    return jsonify({"success": True})


def load_env_config():
    """Load configuration from .env file"""
    config = {}
    env_path = Path(".env")
    if env_path.exists():
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    config[key] = value
    return config


def save_env_config(config_dict):
    """Save configuration to .env file"""
    env_path = Path(".env")
    lines = []
    if env_path.exists():
        with open(env_path, "r") as f:
            lines = f.readlines()

    env_vars = {}
    for line in lines:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _ = line.split("=", 1)
            env_vars[key] = line

    for key, value in config_dict.items():
        env_key = key.upper()
        if env_key == "PASSWORD":
            env_key = "LINKEDIN_PASSWORD"
        elif env_key == "USERNAME":
            env_key = "LINKEDIN_USERNAME"
        env_vars[env_key] = f"{env_key}={value}\n"

    with open(env_path, "w") as f:
        for key in [
            "LINKEDIN_USERNAME",
            "LINKEDIN_PASSWORD",
            "USE_AI",
            "AI_PROVIDER",
            "LLM_API_KEY",
            "LLM_API_URL",
            "LLM_MODEL",
            "LLM_SPEC",
            "STREAM_OUTPUT",
        ]:
            if key in env_vars:
                f.write(env_vars[key])
            else:
                f.write(f"{key}=\n")

    return True


@app.route("/config/secrets", methods=["GET", "POST"])
def config_secrets():
    global secrets_mod
    if request.method == "GET":
        return jsonify(secrets_mod)

    data = request.json
    secrets_mod.update(data)
    save_env_config(secrets_mod)
    return jsonify({"success": True})


@app.route("/config/settings", methods=["GET", "POST"])
def config_settings():
    global settings_mod
    if request.method == "GET":
        return jsonify(settings_mod)

    data = request.json
    settings_mod.update(data)
    save_config_file(settings_mod, "settings.py")
    return jsonify({"success": True})


@app.route("/config/questions", methods=["GET", "POST"])
def config_questions():
    global questions_mod
    if request.method == "GET":
        return jsonify(questions_mod)

    data = request.json
    questions_mod.update(data)
    save_config_file(questions_mod, "questions.py")
    return jsonify({"success": True})


@app.route("/resumes", methods=["GET"])
def get_resumes():
    """Get list of available resumes"""
    resumes = []
    resume_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "resumes")

    if os.path.exists(resume_dir):
        for root, dirs, files in os.walk(resume_dir):
            for file in files:
                if file.lower().endswith((".pdf", ".doc", ".docx")):
                    full_path = os.path.join(root, file)
                    relative_path = os.path.relpath(
                        full_path, os.path.dirname(os.path.abspath(__file__))
                    )
                    resumes.append(relative_path.replace("\\", "/"))

    return jsonify(resumes)


# Bot control
import subprocess
import os
import datetime

bot_process = None


@app.route("/bot/start", methods=["POST"])
def bot_start():
    global bot_process

    if bot_process and bot_process.poll() is None:
        return jsonify({"error": "El bot ya está ejecutándose"}), 400

    try:
        # Change to the script directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        log_file = os.path.join(script_dir, "logs", "bot_ui.log")
        os.makedirs(os.path.dirname(log_file), exist_ok=True)

        # Start the bot in a subprocess with output to file
        log_handle = open(log_file, "w")

        bot_process = subprocess.Popen(
            [sys.executable, "runAiBot.py"],
            cwd=script_dir,
            stdout=log_handle,
            stderr=subprocess.STDOUT,
            text=True,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0,
        )
        print(f"Bot process started with PID: {bot_process.pid}")
        return jsonify(
            {"message": "Bot iniciado correctamente", "pid": bot_process.pid}
        )
    except Exception as e:
        print(f"Error starting bot: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/bot/stop", methods=["POST"])
def bot_stop():
    global bot_process

    if bot_process:
        bot_process.terminate()
        bot_process = None
        return jsonify({"message": "Bot detenido"})

    return jsonify({"error": "No hay bot en ejecución"}), 400


@app.route("/bot/status", methods=["GET"])
def bot_status():
    global bot_process
    running = bot_process is not None and bot_process.poll() is None
    return jsonify(
        {
            "running": running,
            "total_runs": 0,
            "easy_applied_count": 0,
            "external_jobs_count": 0,
            "failed_count": 0,
            "skip_count": 0,
        }
    )


@app.route("/bot/logs", methods=["GET"])
def bot_logs():
    log_file = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "logs", "bot_ui.log"
    )
    logs = []
    try:
        if os.path.exists(log_file):
            with open(log_file, "r", encoding="utf-8") as f:
                lines = f.readlines()
                logs = [line.strip() for line in lines[-100:]]  # Last 100 lines
    except Exception as e:
        logs = [f"Error reading logs: {str(e)}"]

    if not logs:
        logs = ["No hay logs todavía"]

    return jsonify({"logs": logs})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
