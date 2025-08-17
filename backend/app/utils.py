import pandas as pd
from datetime import datetime

DATA_DIR = 'data'
USERS_FILE = f'{DATA_DIR}/users.csv'
GUESTHOUSES_FILE = f'{DATA_DIR}/guesthouses.csv'
BOOKINGS_FILE = f'{DATA_DIR}/bookings.csv'
DATABASE_FILE = 'instance/bookings.db' # SQLite DB path

DATE_FORMAT = "%d-%m-%Y" # As per your screenshot for bookings.csv

def parse_date_string(date_str):
    if not date_str or pd.isna(date_str):
        return None
    try:
        return datetime.strptime(str(date_str), DATE_FORMAT).date()
    except ValueError:
        return None # Or raise an error

def format_date_obj(date_obj):
    if not date_obj:
        return None
    return date_obj.strftime(DATE_FORMAT)

def check_date_overlap(start1, end1, start2, end2):
    """Checks if two date ranges overlap."""
    s1 = parse_date_string(start1)
    e1 = parse_date_string(end1)
    s2 = parse_date_string(start2)
    e2 = parse_date_string(end2)

    if not all([s1, e1, s2, e2]): # If any date is invalid, assume no overlap to be safe
        return False
    return s1 <= e2 and s2 <= e1