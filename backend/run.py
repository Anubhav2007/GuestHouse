from app import create_app

app = create_app()

if __name__ == '__main__':
    # Ensure services are loaded, especially if they initialize files like bookings.csv
    from app.services import user_service, guesthouse_service, booking_service 
    app.run(debug=True, port=5001) # Changed port to 5001 to avoid conflict with React default