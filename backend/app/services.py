import pandas as pd
import uuid
from datetime import datetime
import os
import sqlite3
from .utils import (
    USERS_FILE, GUESTHOUSES_FILE, BOOKINGS_FILE, DATABASE_FILE,
    parse_date_string, format_date_obj, check_date_overlap, DATE_FORMAT
)

# Ensure data directory and files exist
os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)

def init_bookings_csv():
    if not os.path.exists(BOOKINGS_FILE):
        df = pd.DataFrame(columns=['booking_id', 'guesthouse_id', 'username', 'start_date', 'end_date', 'status', 'booked_at'])
        df.to_csv(BOOKINGS_FILE, index=False)
        print(f"DEBUG: {BOOKINGS_FILE} created.")
    else:
        try:
            df = pd.read_csv(BOOKINGS_FILE)
            required_cols = ['booking_id', 'guesthouse_id', 'username', 'start_date', 'end_date', 'status', 'booked_at']
            if not all(col in df.columns for col in required_cols):
                print(f"DEBUG: Warning - {BOOKINGS_FILE} has missing columns. Re-initializing with headers.")
                df_empty = pd.DataFrame(columns=required_cols)
                df_empty.to_csv(BOOKINGS_FILE, index=False)
        except pd.errors.EmptyDataError:
            print(f"DEBUG: Warning - {BOOKINGS_FILE} is empty. Initializing with headers.")
            df_empty = pd.DataFrame(columns=['booking_id', 'guesthouse_id', 'username', 'start_date', 'end_date', 'status', 'booked_at'])
            df_empty.to_csv(BOOKINGS_FILE, index=False)


init_bookings_csv() # Initialize bookings.csv on module load

def export_bookings_to_sqlite():
    """Exports the current bookings.csv to an SQLite database."""
    if not os.path.exists(BOOKINGS_FILE):
        print(f"DEBUG export_bookings_to_sqlite: {BOOKINGS_FILE} not found, skipping export.")
        return False, f"{BOOKINGS_FILE} not found."

    try:
        # Ensure we read the latest from disk
        df = pd.read_csv(BOOKINGS_FILE)
        if df.empty and os.path.getsize(BOOKINGS_FILE) > 0 :
            print(f"WARNING export_bookings_to_sqlite: {BOOKINGS_FILE} was read as empty by pandas but has size. This might indicate a malformed CSV. Proceeding with empty DataFrame for DB.")
            # For safety, treat as empty if pandas can't parse structured data despite file size
            df = pd.DataFrame(columns=['booking_id', 'guesthouse_id', 'username', 'start_date', 'end_date', 'status', 'booked_at'])
        elif df.empty:
            print(f"DEBUG export_bookings_to_sqlite: {BOOKINGS_FILE} is empty, creating empty table in DB.")
            # No return here, we want to create an empty table if CSV is empty.
    except pd.errors.EmptyDataError:
        print(f"DEBUG export_bookings_to_sqlite: {BOOKINGS_FILE} is empty (EmptyDataError), creating empty table in DB.")
        df = pd.DataFrame(columns=['booking_id', 'guesthouse_id', 'username', 'start_date', 'end_date', 'status', 'booked_at'])
    except Exception as e:
        print(f"ERROR export_bookings_to_sqlite: Failed to read {BOOKINGS_FILE}: {str(e)}. Skipping export.")
        return False, f"Failed to read {BOOKINGS_FILE}: {str(e)}"


    os.makedirs(os.path.dirname(DATABASE_FILE), exist_ok=True)
    conn = sqlite3.connect(DATABASE_FILE)
    try:
        # Replace the entire table each time.
        df.to_sql('bookings', conn, if_exists='replace', index=False)
        conn.close()
        return True, f"Bookings exported to {DATABASE_FILE} successfully."
    except Exception as e:
        conn.close()
        print(f"ERROR export_bookings_to_sqlite: Error writing to SQLite: {str(e)}")
        return False, f"Error exporting to SQLite: {str(e)}"

class UserService:
    def __init__(self):
        try:
            self.users_df = pd.read_csv(USERS_FILE)
        except FileNotFoundError:
            print(f"ERROR: {USERS_FILE} not found. Please create it with columns: username, password, role")
            self.users_df = pd.DataFrame(columns=['username', 'password', 'role'])
        except pd.errors.EmptyDataError:
             print(f"WARNING: {USERS_FILE} is empty. Please populate it.")
             self.users_df = pd.DataFrame(columns=['username', 'password', 'role'])


    def get_user(self, username):
        user = self.users_df[self.users_df['username'] == username]
        if not user.empty:
            return user.iloc[0].to_dict()
        return None

class GuesthouseService:
    def __init__(self):
        try:
            self.guesthouses_df = pd.read_csv(GUESTHOUSES_FILE)
            if 'id' in self.guesthouses_df.columns:
                 self.guesthouses_df['id'] = self.guesthouses_df['id'].astype(str)
        except FileNotFoundError:
            print(f"ERROR: {GUESTHOUSES_FILE} not found. Please create it with columns: id, location, name, capacity")
            self.guesthouses_df = pd.DataFrame(columns=['id', 'location', 'name', 'capacity'])
        except pd.errors.EmptyDataError:
            print(f"WARNING: {GUESTHOUSES_FILE} is empty. Please populate it.")
            self.guesthouses_df = pd.DataFrame(columns=['id', 'location', 'name', 'capacity'])


    def get_all_guesthouses(self):
        return self.guesthouses_df.to_dict(orient='records')

    def get_guesthouse_by_id(self, guesthouse_id):
        guesthouse = self.guesthouses_df[self.guesthouses_df['id'].astype(str) == str(guesthouse_id)]
        if not guesthouse.empty:
            return guesthouse.iloc[0].to_dict()
        return None

class BookingService:
    def __init__(self):
        self._load_bookings()
        # Optionally, ensure DB is synced on startup if CSV exists and DB might be stale or missing
        self._sync_db_on_init()

    def _load_bookings(self):
        try:
            self.bookings_df = pd.read_csv(BOOKINGS_FILE)
            if 'guesthouse_id' in self.bookings_df.columns:
                self.bookings_df['guesthouse_id'] = self.bookings_df['guesthouse_id'].astype(str)
            for col in ['start_date', 'end_date', 'booked_at']:
                if col in self.bookings_df.columns:
                    self.bookings_df[col] = self.bookings_df[col].astype(str).fillna('') # fillna for dates
                else: # Add missing date columns if they don't exist
                    self.bookings_df[col] = ''


            # Ensure booking_id exists and fill NaNs
            if 'booking_id' not in self.bookings_df.columns:
                self.bookings_df['booking_id'] = [str(uuid.uuid4()) for _ in range(len(self.bookings_df))]
                self._save_bookings_and_export_to_db()
            elif self.bookings_df['booking_id'].isnull().any():
                self.bookings_df['booking_id'] = self.bookings_df['booking_id'].apply(lambda x: x if pd.notnull(x) and x != '' else str(uuid.uuid4()))
                self._save_bookings_and_export_to_db() # Save and export if IDs generated

        except (FileNotFoundError, pd.errors.EmptyDataError):
            print(f"DEBUG: {BOOKINGS_FILE} is empty or not found. Initializing empty bookings DataFrame.")
            self.bookings_df = pd.DataFrame(columns=['booking_id', 'guesthouse_id', 'username', 'start_date', 'end_date', 'status', 'booked_at'])
            # No need to save here, as init_bookings_csv handles creating an empty file.
            # We will save when a booking is made.

    def _save_bookings_and_export_to_db(self):
        """Saves the bookings DataFrame to CSV and then exports to SQLite."""
        try:
            self.bookings_df.to_csv(BOOKINGS_FILE, index=False)
            print(f"DEBUG: Saved {BOOKINGS_FILE}")
            success, message = export_bookings_to_sqlite()
            if success:
                print(f"DEBUG: SQLite DB updated successfully: {message}")
            else:
                print(f"ERROR: SQLite export failed after saving bookings: {message}")
        except Exception as e:
            print(f"ERROR: Failed to save bookings CSV or export to DB: {str(e)}")


    def _sync_db_on_init(self):
        """Ensures DB is synced with CSV upon service initialization if CSV exists."""
        if os.path.exists(BOOKINGS_FILE): # Only sync if CSV exists
            print("DEBUG: Performing initial sync of bookings.csv to SQLite DB.")
            success, message = export_bookings_to_sqlite()
            if success:
                print(f"DEBUG: Initial DB sync successful: {message}")
            else:
                print(f"ERROR: Initial DB sync failed: {message}")
        else:
            print(f"DEBUG: {BOOKINGS_FILE} does not exist. Skipping initial DB sync.")


    def is_guesthouse_available(self, guesthouse_id, start_date_str, end_date_str):
        guesthouse_id = str(guesthouse_id)
        
        relevant_bookings = self.bookings_df[
            (self.bookings_df['guesthouse_id'] == guesthouse_id) &
            (self.bookings_df['status'].isin(['confirmed', 'pending']))
        ]

        for _, booking in relevant_bookings.iterrows():
            # Ensure booking dates are valid before checking overlap
            if booking['start_date'] and booking['end_date']:
                if check_date_overlap(start_date_str, end_date_str, booking['start_date'], booking['end_date']):
                    return False
        return True

    def create_booking_request(self, guesthouse_id, username, start_date_str, end_date_str):
        guesthouse_id = str(guesthouse_id)
        if not self.is_guesthouse_available(guesthouse_id, start_date_str, end_date_str):
            return None, "Guesthouse not available for selected dates."

        new_booking_id = str(uuid.uuid4())
        # Use a consistent format for booked_at, which can also be DATE_FORMAT
        # Or for more precision: datetime.now().isoformat()
        booked_at_str = datetime.now().strftime(DATE_FORMAT)

        new_booking_data = {
            'booking_id': new_booking_id,
            'guesthouse_id': guesthouse_id,
            'username': username,
            'start_date': start_date_str,
            'end_date': end_date_str,
            'status': 'pending',
            'booked_at': booked_at_str
        }
        
        # If bookings_df is empty and has no columns (first run after init_bookings_csv made an empty file)
        if self.bookings_df.empty and not list(self.bookings_df.columns):
            self.bookings_df = pd.DataFrame([new_booking_data])
        else:
            new_booking_df_row = pd.DataFrame([new_booking_data])
            self.bookings_df = pd.concat([self.bookings_df, new_booking_df_row], ignore_index=True)
        
        self._save_bookings_and_export_to_db()
        return new_booking_id, "Booking request submitted successfully."

    def get_user_bookings(self, username):
        if self.bookings_df.empty or 'username' not in self.bookings_df.columns:
            return []
        user_bookings = self.bookings_df[self.bookings_df['username'] == username]
        return user_bookings.to_dict(orient='records')

    def get_all_bookings(self):
        if self.bookings_df.empty:
            return []
            
        gs_service_instance = GuesthouseService() # Get fresh instance if guesthouses can change
        guesthouses_df = gs_service_instance.guesthouses_df[['id', 'name']].copy()
        guesthouses_df.rename(columns={'id': 'guesthouse_id', 'name': 'guesthouse_name'}, inplace=True)
        guesthouses_df['guesthouse_id'] = guesthouses_df['guesthouse_id'].astype(str)
        
        # Ensure self.bookings_df has guesthouse_id for merging
        if 'guesthouse_id' not in self.bookings_df.columns:
            print("WARNING: 'guesthouse_id' column missing in bookings. Cannot merge guesthouse names.")
            # Add a placeholder or return raw bookings
            temp_bookings_df = self.bookings_df.copy()
            temp_bookings_df['guesthouse_name'] = 'N/A (Missing ID)'
            return temp_bookings_df.to_dict(orient='records')

        merged_df = pd.merge(self.bookings_df.copy(), guesthouses_df, on='guesthouse_id', how='left')
        merged_df['guesthouse_name'].fillna('Unknown Guesthouse', inplace=True)
        return merged_df.to_dict(orient='records')


    def get_pending_bookings(self):
        if self.bookings_df.empty or 'status' not in self.bookings_df.columns:
            return []
        pending_df = self.bookings_df[self.bookings_df['status'] == 'pending'].copy() # Use .copy()
        
        if pending_df.empty:
            return []

        gs_service_instance = GuesthouseService()
        guesthouses_df = gs_service_instance.guesthouses_df[['id', 'name']].copy()
        guesthouses_df.rename(columns={'id': 'guesthouse_id', 'name': 'guesthouse_name'}, inplace=True)
        guesthouses_df['guesthouse_id'] = guesthouses_df['guesthouse_id'].astype(str)
        
        if 'guesthouse_id' not in pending_df.columns:
            print("WARNING: 'guesthouse_id' column missing in pending bookings. Cannot merge guesthouse names.")
            pending_df['guesthouse_name'] = 'N/A (Missing ID)'
            return pending_df.to_dict(orient='records')
            
        merged_df = pd.merge(pending_df, guesthouses_df, on='guesthouse_id', how='left')
        merged_df['guesthouse_name'].fillna('Unknown Guesthouse', inplace=True)
        return merged_df.to_dict(orient='records')

    def update_booking_status(self, booking_id, new_status, admin_username=None):
        if self.bookings_df.empty or 'booking_id' not in self.bookings_df.columns:
            return False, "No bookings found."
        if booking_id not in self.bookings_df['booking_id'].values:
            return False, "Booking ID not found."
        
        booking_to_update = self.bookings_df[self.bookings_df['booking_id'] == booking_id].iloc[0]

        if new_status == 'confirmed':
            guesthouse_id = booking_to_update['guesthouse_id']
            start_date = booking_to_update['start_date']
            end_date = booking_to_update['end_date']

            # Temporarily exclude the current booking from availability check
            original_bookings_df_snapshot = self.bookings_df.copy() # For restore if check fails
            # Create a temporary df for availability check excluding the one being confirmed
            temp_check_df = self.bookings_df[self.bookings_df['booking_id'] != booking_id]
            
            # Simulate is_guesthouse_available on this temp_check_df
            available = True
            relevant_bookings_for_check = temp_check_df[
                (temp_check_df['guesthouse_id'] == str(guesthouse_id)) &
                (temp_check_df['status'].isin(['confirmed', 'pending'])) # Check against other pending too
            ]
            for _, BKG in relevant_bookings_for_check.iterrows():
                 if BKG['start_date'] and BKG['end_date']:
                    if check_date_overlap(start_date, end_date, BKG['start_date'], BKG['end_date']):
                        available = False
                        break
            
            if not available:
                return False, "Cannot confirm: Guesthouse became unavailable due to another overlapping booking."
            # No need to restore self.bookings_df here as we only used a copy for check

        self.bookings_df.loc[self.bookings_df['booking_id'] == booking_id, 'status'] = new_status
        self._save_bookings_and_export_to_db()
        return True, f"Booking {booking_id} status updated to {new_status}."

    def cancel_booking(self, booking_id, username):
        if self.bookings_df.empty or 'booking_id' not in self.bookings_df.columns:
            return False, "No bookings found to cancel."

        booking_matches = self.bookings_df[
            (self.bookings_df['booking_id'] == booking_id) &
            (self.bookings_df['username'] == username)
        ]

        if booking_matches.empty:
            return False, "Booking not found or you don't have permission to cancel."

        booking_idx = booking_matches.index[0] # Get the index of the first match
        current_status = self.bookings_df.loc[booking_idx, 'status']

        if current_status == 'cancelled':
             return False, "Booking already cancelled."
        
        if current_status in ['pending', 'confirmed']:
            self.bookings_df.loc[booking_idx, 'status'] = 'cancelled'
            self._save_bookings_and_export_to_db()
            return True, "Booking cancelled successfully."
        else:
            return False, f"Cannot cancel booking with status: {current_status}."

# Instantiate services (Global instances)
user_service = UserService()
guesthouse_service = GuesthouseService()
booking_service = BookingService() # This will now also call _sync_db_on_init