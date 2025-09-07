# TibaCloud

This a web3 healthcare management platform that enables patients to easily and effectively access healthcare services from healthcare providers and payment is made using Mpesa, but the service rovider receives the payment in stable coins. This is a Stellar Web3 project.

## Technologies Used

### Backend
*   **Framework:** Laravel (PHP)
*   **Dependency Management:** Composer
*   **Authentication:** Laravel Sanctum

### Frontend
*   **Framework:** React.js
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **UI Library:** Shadcn UI (built on Radix UI)
*   **Styling:** Tailwind CSS
*   **Routing:** React Router DOM
*   **API Client:** Axios
*   **Data Fetching/Caching:** React Query
*   **Form Management:** React Hook Form
*   **Schema Validation:** Zod

## How to Run the Application

To get this application up and running, you will need to set up both the backend and the frontend components separately.

### Prerequisites

Before you start, ensure you have the following installed on your system:

*   **PHP** (version 8.2 or higher)
*   **Composer**
*   **Node.js** (LTS version recommended)
*   **npm** (comes with Node.js) or **Yarn** or **Bun**
*   A **Database** (e.g., MySQL, PostgreSQL, SQLite) compatible with Laravel.

### 1. Backend Setup (Laravel)

Navigate to the `Backend` directory in your terminal:

```bash
cd Backend
```

Follow these steps:

1.  **Install PHP Dependencies:**
    ```bash
    composer install
    ```

2.  **Set up Environment Variables:**
    Copy the example environment file and generate an application key.
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
    Open the newly created `.env` file and configure your database connection details (e.g., `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).

3.  **Run Database Migrations:**
    This will create the necessary tables in your database.
    ```bash
    php artisan migrate
    ```

4.  **Start the Backend Development Server:**
    ```bash
    php artisan serve
    ```
    The backend server will typically run on `http://127.0.0.1:8000`.

### 2. Frontend Setup (React/Vite)

Open a **new terminal window** and navigate to the `Frontend` directory:

```bash
cd Frontend
```

Follow these steps:

1.  **Install Node.js Dependencies:**
    ```bash
    npm install
    # or yarn install
    # or bun install
    ```

2.  **Configure API Endpoint (if necessary):**
    Ensure your frontend is configured to communicate with the backend. You might need to adjust the API base URL in the frontend's configuration (e.g., in a file like `src/lib/axios.ts` or similar) to point to your Laravel backend (e.g., `http://127.0.0.1:8000`).

3.  **Start the Frontend Development Server:**
    ```bash
    npm run dev
    ```
    The frontend development server will typically run on `http://localhost:5173` (or a similar port). Your application will be accessible via this URL in your web browser.

---

**Note:** Make sure both the backend and frontend development servers are running concurrently for the application to function correctly.

## Author
[Joseph Okumu](https://github.com/JosephOkumu)
