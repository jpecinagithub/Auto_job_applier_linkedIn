'''
Author:     Sai Vignesh Golla
LinkedIn:   https://www.linkedin.com/in/saivigneshgolla/

Copyright (C) 2024 Sai Vignesh Golla

License:    GNU Affero General Public License
            https://www.gnu.org/licenses/agpl-3.0.en.html
            
GitHub:     https://github.com/GodsScion/Auto_job_applier_linkedIn

Support me: https://github.com/sponsors/GodsScion

version:    26.01.20.5.08
'''

import os
import tempfile

from modules.helpers import get_default_temp_profile, make_directories
from config.settings import run_in_background, stealth_mode, disable_extensions, safe_mode, file_name, failed_file_name, logs_folder_path, generated_resume_path
from config.questions import default_resume_path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
if stealth_mode:
    import undetected_chromedriver as uc
# from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from modules.helpers import find_default_profile_directory, critical_error_log, print_lg
from selenium.common.exceptions import SessionNotCreatedException

def createChromeSession(isRetry: bool = False, use_stealth: bool = stealth_mode, use_profile: bool = True):
    make_directories([file_name,failed_file_name,logs_folder_path+"/screenshots",default_resume_path,generated_resume_path+"/temp"])
    # Set up WebDriver with Chrome Profile
    options = uc.ChromeOptions() if use_stealth else Options()
    if run_in_background:   options.add_argument("--headless=new")
    if disable_extensions:  options.add_argument("--disable-extensions")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-first-run")
    options.add_argument("--no-default-browser-check")
    options.add_argument("--disable-notifications")
    options.add_argument("--window-size=1920,1080")

    print_lg("IF YOU HAVE MORE THAN 10 TABS OPENED, PLEASE CLOSE OR BOOKMARK THEM! Or it's highly likely that application will just open browser and not do anything!")
    profile_dir = find_default_profile_directory()
    if not use_profile:
        print_lg("Starting Chrome without custom user-data-dir (clean session fallback).")
    elif isRetry:
        print_lg("Will login with a guest profile, browsing history will not be saved in the browser!")
        temp_root = get_default_temp_profile()
        make_directories([temp_root])
        unique_profile = tempfile.mkdtemp(prefix="auto-job-profile-", dir=temp_root)
        options.add_argument(f"--user-data-dir={unique_profile}")
    elif profile_dir and not safe_mode:
        options.add_argument(f"--user-data-dir={profile_dir}")
    else:
        print_lg("Logging in with a guest profile, Web history will not be saved!")
        temp_root = get_default_temp_profile()
        make_directories([temp_root])
        unique_profile = tempfile.mkdtemp(prefix="auto-job-profile-", dir=temp_root)
        options.add_argument(f"--user-data-dir={unique_profile}")
    if use_stealth:
        # try: 
        #     driver = uc.Chrome(driver_executable_path="C:\\Program Files\\Google\\Chrome\\chromedriver-win64\\chromedriver.exe", options=options)
        # except (FileNotFoundError, PermissionError) as e: 
        #     print_lg("(Undetected Mode) Got '{}' when using pre-installed ChromeDriver.".format(type(e).__name__)) 
            print_lg("Downloading Chrome Driver... This may take some time. Undetected mode requires download every run!")
            driver = uc.Chrome(options=options)
    else: driver = webdriver.Chrome(options=options) #, service=Service(executable_path="C:\\Program Files\\Google\\Chrome\\chromedriver-win64\\chromedriver.exe"))
    driver.maximize_window()
    wait = WebDriverWait(driver, 10)
    actions = ActionChains(driver)
    return options, driver, actions, wait

try:
    options, driver, actions, wait = None, None, None, None
    options, driver, actions, wait = createChromeSession(use_stealth=stealth_mode)
except SessionNotCreatedException as e:
    critical_error_log("Failed to create Chrome Session, retrying with guest profile", e)
    try:
        options, driver, actions, wait = createChromeSession(True, use_stealth=stealth_mode)
    except SessionNotCreatedException as e2:
        critical_error_log("Retry with guest profile failed. Retrying with clean no-profile session.", e2)
        options, driver, actions, wait = createChromeSession(True, use_stealth=False, use_profile=False)
except Exception as e:
    if stealth_mode:
        try:
            print_lg("Undetected Chrome failed. Retrying with standard Selenium ChromeDriver...")
            options, driver, actions, wait = createChromeSession(True, use_stealth=False)
        except Exception as e2:
            msg = 'Seems like Google Chrome is out dated. Update browser and try again! \n\n\nIf issue persists, try Safe Mode. Set, safe_mode = True in config.py \n\nPlease check GitHub discussions/support for solutions https://github.com/GodsScion/Auto_job_applier_linkedIn \n                                   OR \nReach out in discord ( https://discord.gg/fFp7uUzWCY )'
            if isinstance(e2,TimeoutError): msg = "Couldn't download Chrome-driver. Set stealth_mode = False in config!"
            print_lg(msg)
            critical_error_log("In Opening Chrome", e2)
            from pyautogui import alert
            alert(msg, "Error in opening chrome")
            try: driver.quit()
            except NameError: exit()
    else:
        msg = 'Seems like Google Chrome is out dated. Update browser and try again! \n\n\nIf issue persists, try Safe Mode. Set, safe_mode = True in config.py \n\nPlease check GitHub discussions/support for solutions https://github.com/GodsScion/Auto_job_applier_linkedIn \n                                   OR \nReach out in discord ( https://discord.gg/fFp7uUzWCY )'
        if isinstance(e,TimeoutError): msg = "Couldn't download Chrome-driver. Set stealth_mode = False in config!"
        print_lg(msg)
        critical_error_log("In Opening Chrome", e)
        from pyautogui import alert
        alert(msg, "Error in opening chrome")
        try: driver.quit()
        except NameError: exit()
    
