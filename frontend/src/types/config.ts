export interface PersonalsConfig {
  first_name: string;
  middle_name: string;
  last_name: string;
  phone_number: string;
  phone_country_code: string;
  current_city: string;
  street: string;
  state: string;
  zipcode: string;
  country: string;
  ethnicity: string;
  gender: string;
  disability_status: string;
  veteran_status: string;
}

export interface SearchConfig {
  search_terms: string[];
  search_location: string;
  switch_number: number;
  randomize_search_order: boolean;
  sort_by: string;
  date_posted: string;
  salary: string;
  easy_apply_only: boolean;
  experience_level: string[];
  job_type: string[];
  on_site: string[];
  companies: string[];
  location: string[];
  industry: string[];
  job_function: string[];
  job_titles: string[];
  benefits: string[];
  commitments: string[];
  under_10_applicants: boolean;
  in_your_network: boolean;
  fair_chance_employer: boolean;
  english_only_jobs: boolean;
  pause_after_filters: boolean;
  about_company_bad_words: string[];
  about_company_good_words: string[];
  bad_words: string[];
  exclude_locations: string[];
  security_clearance: boolean;
  did_masters: boolean;
  current_experience: number;
}

export interface SecretsConfig {
  username: string;
  password: string;
  use_AI: boolean;
  ai_provider: string;
  llm_api_url: string;
  llm_api_key: string;
  llm_model: string;
  llm_spec: string;
  stream_output: boolean;
}

export interface SettingsConfig {
  close_tabs: boolean;
  follow_companies: boolean;
  run_non_stop: boolean;
  alternate_sortby: boolean;
  cycle_date_posted: boolean;
  stop_date_cycle_at_24hr: boolean;
  generated_resume_path: string;
  file_name: string;
  failed_file_name: string;
  logs_folder_path: string;
  click_gap: number;
  run_in_background: boolean;
  disable_extensions: boolean;
  safe_mode: boolean;
  smooth_scroll: boolean;
  keep_screen_awake: boolean;
  stealth_mode: boolean;
  showAiErrorAlerts: boolean;
}

export interface QuestionsConfig {
  years_of_experience: string;
  linkedIn: string;
  website: string;
  linkedin_summary: string;
  cover_letter: string;
  recent_employer: string;
  linkedin_headline: string;
  require_visa: string;
  default_resume_path: string;
  overwrite_previous_answers: boolean;
  follow_previous_answers: boolean;
  pause_before_submit: boolean;
  pause_at_failed_question: boolean;
}

export interface BotStatus {
  running: boolean;
  total_runs: number;
  easy_applied_count: number;
  external_jobs_count: number;
  failed_count: number;
  skip_count: number;
  current_search_term: string;
  current_job_title: string;
  current_company: string;
}

export interface JobHistory {
  Job_ID: string;
  Title: string;
  Company: string;
  Work_Location: string;
  Work_Style: string;
  About_Job: string;
  Experience_required: string;
  Skills_required: string;
  HR_Name: string;
  HR_Link: string;
  Resume: string;
  Re_posted: string;
  Date_Posted: string;
  Date_Applied: string;
  Job_Link: string;
  External_Job_link: string;
  Questions_Found: string;
  Connect_Request: string;
}

export type ConfigSection = 'search' | 'personals' | 'secrets' | 'settings' | 'questions';
