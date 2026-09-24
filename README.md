# Pizza Delivery Microservices Application

A scalable **Microservices Application** for pizza ordering and delivery management built with **NestJS**, **TypeScript**, **PostgreSQL**, and **MongoDB**, utilizing **RabbitMQ** as an asynchronous message broker.

---

## System Architecture & Services

The application is built inside a unified **monorepository** containing the following independent nodes:

*   **`api-gateway` (Port 3000):** The single public entry point. Handles HTTP routing, Swagger documentation layout, global DTO validation, static image distribution (`/uploads`), and JWT-based role authorization (`admin` / `user`).
*   **`auth-service`:** Manages user registration/login, secure password hashing, and session authentication tokens.
*   **`pizza-service`:** The core business-logic service handling the product catalog (**Pizzas**, **Ingredients**), shopping **Cart** workflows, **Promo Code** validation, and transaction-safe **Orders** logging (with price-snapshots to prevent historical data mutation).
*   **`logger-service`:** An event-driven, centralized telemetry system that listens to RabbitMQ logs asynchronously and records system metrics (`INFO`), alerts (`WARN`), and exceptions (`ERROR`).
*   **`notification-service`:** Listens for registration events and critical system crashes or transaction milestones to send emails.

---

## Tech Stack & Infrastructure

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | NestJS (TypeScript) | Core modular microservice framework |
| **Broker** | RabbitMQ (Port 15672) | Asynchronous cross-service event transport |
| **RDBMS** | PostgreSQL + TypeORM | Strict, relational schemas for Catalog and Orders |
| **NoSQL** | MongoDB + Mongoose | High-speed structured document logging database |
| **DevOps** | Docker & Docker Compose | Containerized isolated cross-platform environment |
| **Logs UI Panel** | Mongo Express (Port 8081) | Lightweight, web-based management UI for Logs |
| **Email Web-UI** | Mailpit (Port 8025) | Web-based management UI for Emails |
---

## Quick Start & Deployment

### Prerequisites
Make sure you have **Docker Desktop** installed on your host machine.

### 1. Configure Environment Variables
Create a `.env` file in the root directory and define database credentials according to .env.example

### 2. Run the Entire System
Launch all microservices, databases, and message brokers containerized in the background:
```bash
docker compose up -d --build
```

### 3. Verify Application Access
*   **Swagger API Docs:** [http://localhost:3000/api](http://localhost:3000/api)
*   **RabbitMQ UI:** [http://localhost:15672](http://localhost:15672) *(Credentials: `pizza_rabbit` / `pizza_rabbit_5578`)*
*   **Centralized Logs View (Mongo Express):** [http://localhost:8081](http://localhost:8081) *(Credentials: `admin` / `logpass`)*
*   **Mailpit UI:** [http://localhost:8025](http://localhost:8025)

---

## Testing Execution

Unit tests are written using the Jest framework in combination with `@swc/jest` to guarantee isolated execution bypassing ESM module conflicts.

Execute microservice tests directly inside the stable Linux container environment:
```bash
# Run Cart Management Service unit tests
docker exec -it pizza_pizza_service npx jest --config apps/pizza-service/jest-pizza.config.json
```
