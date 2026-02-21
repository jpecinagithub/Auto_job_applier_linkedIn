from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import csv
import os
import sys
import io
import threading
import time
from datetime import datetime
from contextlib import redirect_stdout, redirect_stderr

app = Flask(__name__, template_folder="templates")
CORS(app)

PATH = "all excels/"

# Global variables for bot control
bot_process = None
bot_running = False
bot_status = {
    "running": False,
    "total_runs": 0,
    "easy_applied_count": 0,
    "external_jobs_count": 0,
    "failed_count": 0,
    "skip_count": 0,
    "current_search_term": "",
    "current_job_title": "",
    "current_company": "",
}
bot_logs = []

# Store original stdout/stderr
original_stdout = sys.stdout
original_stderr = sys.stderr


def get_config_module():
    """Import and return the search module fresh"""
    try:
        import config.search as search_module
        import importlib

        importlib.reload(search_module)
        print(f"[DEBUG] Module attrs: {dir(search_module)}")
        print(
            f"[DEBUG] search_terms = {getattr(search_module, 'search_terms', 'NOT FOUND')}"
        )
        return search_module
    except Exception as e:
        print(f"[DEBUG] Error importing search module: {e}")
        import traceback

        traceback.print_exc()
        return None


def import_config_modules():
    """Import all config modules"""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    try:
        from config import personals, search, secrets, settings, questions

        return personals, search, secrets, settings, questions
    except ImportError as e:
        print(f"Error importing config: {e}")
        return None, None, None, None, None


# Import config modules
personals, search_mod, secrets_mod, settings_mod, questions_mod = (
    import_config_modules()
)


# Routes for serving static files and HTML
@app.route("/")
def home():
    """Displays the home page of the application."""
    return render_template("index.html")


@app.route("/applied-jobs", methods=["GET"])
def get_applied_jobs():
    """Retrieves list of applied jobs"""
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
                        "About_Job": row.get("About Job", ""),
                        "Experience_required": row.get("Experience required", ""),
                        "Skills_required": row.get("Skills required", ""),
                        "HR_Name": row.get("HR Name", ""),
                        "HR_Link": row.get("HR Link", ""),
                        "Resume": row.get("Resume", ""),
                        "Re_posted": row.get("Re-posted", ""),
                        "Date_Posted": row.get("Date Posted", ""),
                        "Date_Applied": row.get("Date Applied", ""),
                        "Job_Link": row.get("Job Link", ""),
                        "External_Job_link": row.get("External Job link", ""),
                        "Questions_Found": row.get("Questions Found", ""),
                        "Connect_Request": row.get("Connect Request", ""),
                    }
                )
        return jsonify(jobs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/failed-jobs", methods=["GET"])
def get_failed_jobs():
    """Retrieves list of failed jobs"""
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
                        "Work_Location": row.get("Work Location", ""),
                        "Work_Style": row.get("Work Style", ""),
                        "About_Job": row.get("About Job", ""),
                        "Experience_required": row.get("Experience required", ""),
                        "Skills_required": row.get("Skills required", ""),
                        "HR_Name": row.get("HR Name", ""),
                        "HR_Link": row.get("HR Link", ""),
                        "Resume": row.get("Resume", ""),
                        "Re_posted": row.get("Re-posted", ""),
                        "Date_Posted": row.get("Date Posted", ""),
                        "Date_Applied": row.get("Date Applied", ""),
                        "Job_Link": row.get("Job Link", ""),
                        "External_Job_link": row.get("External Job link", ""),
                        "Questions_Found": row.get("Questions Found", ""),
                        "Connect_Request": row.get("Connect Request", ""),
                    }
                )
        return jsonify(jobs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/applied-jobs/<job_id>", methods=["PUT"])
def update_applied_date(job_id):
    """Updates the 'Date Applied' field of a job"""
    try:
        data = []
        csvPath = PATH + "all_applied_applications_history.csv"

        if not os.path.exists(csvPath):
            return jsonify({"error": f"CSV file not found"}), 404

        with open(csvPath, "r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            fieldNames = reader.fieldnames
            found = False
            for row in reader:
                if row["Job ID"] == job_id:
                    row["Date Applied"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    found = True
                data.append(row)

        if not found:
            return jsonify({"error": f"Job ID {job_id} not found"}), 404

        with open(csvPath, "w", encoding="utf-8", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=fieldNames)
            writer.writeheader()
            writer.writerows(data)

        return jsonify({"message": "Date Applied updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Config endpoints
def save_to_file(module, data, filepath):
    """Save config data to file"""
    list_fields = [
        "search_terms",
        "experience_level",
        "job_type",
        "on_site",
        "companies",
        "location",
        "industry",
        "job_function",
        "job_titles",
        "benefits",
        "commitments",
        "about_company_bad_words",
        "about_company_good_words",
        "bad_words",
    ]

    print(f"[DEBUG] Saving to {filepath}")
    print(f"[DEBUG] Data received: {data}")

    for key, value in data.items():
        print(f"[DEBUG] Processing key={key}, value={value}, type={type(value)}")

        # Always handle list_fields as lists regardless of original value
        if key in list_fields:
            if isinstance(value, str):
                value = [v.strip() for v in value.split(",")] if value else []
            elif isinstance(value, list):
                pass  # Keep as list
            else:
                value = [value] if value else []
            setattr(module, key, value)
            print(f"[DEBUG] Set {key} = {value}")
        elif hasattr(module, key):
            # Determine the type of the original variable
            original_value = getattr(module, key)
            if isinstance(original_value, bool):
                value = (
                    value.lower() == "true" if isinstance(value, str) else bool(value)
                )
            elif isinstance(original_value, int):
                value = int(value)
            elif isinstance(original_value, float):
                value = float(value)
            setattr(module, key, value)

    # Write back to file
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("'''\n")
        f.write("Author:     Generated by UI\n\n")
        f.write("Copyright (C) 2024\n")
        f.write("'''\n\n")

        for key in dir(module):
            if key.startswith("_") or key in ["os", "sys"]:
                continue
            value = getattr(module, key)
            if callable(value):
                continue
            if isinstance(value, str):
                # Handle empty or simple strings - use single quotes
                if value:
                    f.write(f'{key} = "{value}"\n')
                else:
                    f.write(f'{key} = ""\n')
            elif isinstance(value, list):
                # Format list as Python list
                f.write(f"{key} = {value}\n")
            else:
                f.write(f"{key} = {value}\n")

    print(f"[DEBUG] Saved successfully to {filepath}")


@app.route("/config/personals", methods=["GET", "POST"])
def config_personals():
    if request.method == "GET":
        if not personals:
            return jsonify({})

        config = {}
        for key in [
            "first_name",
            "middle_name",
            "last_name",
            "phone_number",
            "phone_country_code",
            "current_city",
            "street",
            "state",
            "zipcode",
            "country",
            "ethnicity",
            "gender",
            "disability_status",
            "veteran_status",
        ]:
            config[key] = get_config_value(personals, key, "")
        return jsonify(config)

    # POST - Save
    data = request.json
    if personals and "personals.py" in os.listdir("config"):
        save_to_file(personals, data, "config/personals.py")
    return jsonify({"success": True})


@app.route("/config/search", methods=["GET", "POST"])
def config_search():
    if request.method == "GET":
        search_module = get_config_module()
        if not search_module:
            return jsonify({})

        config = {}
        list_keys = [
            "search_terms",
            "experience_level",
            "job_type",
            "on_site",
            "companies",
            "location",
            "industry",
            "job_function",
            "job_titles",
            "benefits",
            "commitments",
            "about_company_bad_words",
            "about_company_good_words",
            "bad_words",
        ]
        keys = [
            "search_terms",
            "search_location",
            "switch_number",
            "randomize_search_order",
            "sort_by",
            "date_posted",
            "salary",
            "easy_apply_only",
            "experience_level",
            "job_type",
            "on_site",
            "companies",
            "location",
            "industry",
            "job_function",
            "job_titles",
            "benefits",
            "commitments",
            "under_10_applicants",
            "in_your_network",
            "fair_chance_employer",
            "english_only_jobs",
            "pause_after_filters",
            "about_company_bad_words",
            "about_company_good_words",
            "bad_words",
            "security_clearance",
            "did_masters",
            "current_experience",
        ]

        for key in keys:
            try:
                value = getattr(
                    search_module, key, "" if key not in ["switch_number"] else 30
                )
            except:
                value = "" if key not in ["switch_number"] else 30
            # Handle lists properly
            if key in list_keys and isinstance(value, list):
                config[key] = value
            else:
                config[key] = value
        print(f"[DEBUG] Returning config: {config}")
        return jsonify(config)

    data = request.json
    print(f"[DEBUG] Received search config: {data}")

    # Ensure search_terms has at least one item
    if "search_terms" in data:
        if not data["search_terms"] or (
            isinstance(data["search_terms"], list) and len(data["search_terms"]) == 0
        ):
            # Check if there's a string value
            if isinstance(data["search_terms"], str) and data["search_terms"].strip():
                data["search_terms"] = [
                    s.strip() for s in data["search_terms"].split(",") if s.strip()
                ]
            else:
                # Set default if empty
                data["search_terms"] = ["Software Engineer"]

    search_module = get_config_module()
    if search_module:
        save_to_file(search_module, data, "config/search.py")
    return jsonify({"success": True})


@app.route("/config/secrets", methods=["GET", "POST"])
def config_secrets():
    if request.method == "GET":
        if not secrets_mod:
            return jsonify({})

        config = {}
        for key in [
            "username",
            "password",
            "use_AI",
            "ai_provider",
            "llm_api_url",
            "llm_api_key",
            "llm_model",
            "llm_spec",
            "stream_output",
        ]:
            config[key] = get_config_value(secrets_mod, key, "")
        return jsonify(config)

    data = request.json
    if secrets_mod:
        save_to_file(secrets_mod, data, "config/secrets.py")
    return jsonify({"success": True})


@app.route("/config/settings", methods=["GET", "POST"])
def config_settings():
    if request.method == "GET":
        if not settings_mod:
            return jsonify({})

        config = {}
        for key in [
            "close_tabs",
            "follow_companies",
            "run_non_stop",
            "alternate_sortby",
            "cycle_date_posted",
            "stop_date_cycle_at_24hr",
            "generated_resume_path",
            "file_name",
            "failed_file_name",
            "logs_folder_path",
            "click_gap",
            "run_in_background",
            "disable_extensions",
            "safe_mode",
            "smooth_scroll",
            "keep_screen_awake",
            "stealth_mode",
            "showAiErrorAlerts",
        ]:
            config[key] = get_config_value(settings_mod, key, "")
        return jsonify(config)

    data = request.json
    if settings_mod:
        save_to_file(settings_mod, data, "config/settings.py")
    return jsonify({"success": True})


@app.route("/config/questions", methods=["GET", "POST"])
def config_questions():
    if request.method == "GET":
        if not questions_mod:
            return jsonify({})

        config = {}
        for key in [
            "years_of_experience",
            "linkedIn",
            "website",
            "linkedin_summary",
            "cover_letter",
            "recent_employer",
            "linkedin_headline",
            "require_visa",
            "default_resume_path",
            "overwrite_previous_answers",
            "follow_previous_answers",
            "pause_before_submit",
            "pause_at_failed_question",
        ]:
            config[key] = get_config_value(questions_mod, key, "")
        return jsonify(config)

    data = request.json
    if questions_mod:
        save_to_file(questions_mod, data, "config/questions.py")
    return jsonify({"success": True})


# Bot control endpoints
@app.route("/bot/start", methods=["POST"])
def bot_start():
    global bot_running, bot_process

    if bot_running:
        return jsonify({"error": "Bot already running"}), 400

    try:
        # Start bot in background thread
        def run_bot():
            global bot_running, bot_status, bot_logs

            # Capture output
            output_buffer = io.StringIO()

            try:
                sys.stdout = output_buffer
                sys.stderr = output_buffer

                # Reload config modules to get latest values
                import importlib
                import config.personals
                import config.search
                import config.secrets
                import config.settings
                import config.questions

                importlib.reload(config.personals)
                importlib.reload(config.search)
                importlib.reload(config.secrets)
                importlib.reload(config.settings)
                importlib.reload(config.questions)

                # Import and run the bot
                import runAiBot

                runAiBot.main()
            except Exception as e:
                print(f"Error running bot: {e}")
            finally:
                sys.stdout = original_stdout
                sys.stderr = original_stderr
                bot_running = False
                bot_status["running"] = False

        thread = threading.Thread(target=run_bot, daemon=True)
        thread.start()

        bot_running = True
        bot_status["running"] = True

        return jsonify({"success": True, "message": "Bot started"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/bot/stop", methods=["POST"])
def bot_stop():
    global bot_running, bot_process
    bot_running = False
    bot_status["running"] = False
    return jsonify({"success": True, "message": "Bot stopped"})


@app.route("/bot/status", methods=["GET"])
def bot_status_endpoint():
    return jsonify(bot_status)


@app.route("/bot/logs", methods=["GET"])
def bot_logs_endpoint():
    # Read logs from file
    logs = []
    try:
        log_file = "logs/bot.log"
        if os.path.exists(log_file):
            with open(log_file, "r", encoding="utf-8") as f:
                lines = f.readlines()
                logs = [line.strip() for line in lines[-100:]]  # Last 100 lines
    except:
        pass

    # Add in-memory logs
    logs.extend(bot_logs[-50:])

    return jsonify({"logs": logs})


if __name__ == "__main__":
    # Create templates folder if it doesn't exist
    if not os.path.exists("templates"):
        os.makedirs("templates")

    # Create a simple index.html if it doesn't exist
    if not os.path.exists("templates/index.html"):
        with open("templates/index.html", "w") as f:
            f.write(
                "<!DOCTYPE html><html><head><title>LinkedIn Bot</title></head><body><h1>Loading...</h1></body></html>"
            )

    app.run(debug=True, port=5000)
