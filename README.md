# Investment Simulation Platform (MVP)

A Flask-based web application for simulating investments. Users can simulate deposits and invest in virtual products, while admins manage the platform.

## Features
- **Client Role**: View products, simulate deposits ($500), invest, view transaction history.
- **Admin Role**: Manage users, adjust balances, add new products, view global activity feed.
- **Tech Stack**: Python (Flask), SQLite, SQLAlchemy, Tailwind CSS.

## Setup Instructions

### 1. Prerequisites
- Python 3.8+ installed.

### 2. Installation
1.  Navigate to the project directory:
    ```bash
    cd investment_sim
    ```
    *(Note: if you are using the provided structure directly on Desktop/Page, just stay there)*

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

### 3. Database Initialization
Run the initialization script to create the database and seed it with default users:
```bash
python create_db.py
```
This will create:
- **Admin User**: username: `admin`, password: `admin123`
- **Client User**: username: `client`, password: `client123`
- **Sample Products** into the database (`instance/investment_sim.db`).

### 4. Running the Application
Start the Flask development server:
```bash
python run.py
```
Access the application at: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## Usage

- **Login**: Go to `/login`.
- **Client Tests**: Login as `client`. Try depositing and investing.
- **Admin Tests**: Login as `admin`. Try adding a product or modifying the client's balance.
