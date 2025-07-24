# Product API Documentation

A RESTful API for managing products built with NestJS, TypeORM, PostgreSQL, and JWT authentication.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Request/Response Examples](#requestresponse-examples)

## Features

- CRUD operations for products
- Data validation using class-validator
- PostgreSQL database integration
- UUID-based primary keys
- Environment-based configuration
- Input sanitization and validation
- Comprehensive error handling
- JWT-based authentication and authorization
- User registration and login system
- Protected API endpoints

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- A JWT secret key for authentication

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd product-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up PostgreSQL database:

```sql
CREATE DATABASE product_db;
```

4. Update your `.env` file with a secure JWT secret:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

## Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=product_db

# Application Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

## Running the Application

```bash
npm run start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Base URL

```
http://localhost:3000
```

> [!NOTE]  
> This application has been deployed to render, here is the url:

```
 https://product-api-d5eu.onrender.com
```

### Authentication Endpoints

| Method | Endpoint         | Description         | Authentication |
| ------ | ---------------- | ------------------- | -------------- |
| POST   | `/auth/register` | Register a new user | Public         |
| POST   | `/auth/login`    | Login user          | Public         |
| GET    | `/auth/profile`  | Get user profile    | Required       |
| POST   | `/auth/refresh`  | Refresh JWT token   | Required       |
| POST   | `/auth/logout`   | Logout user         | Required       |

### Product Endpoints (All require authentication)

| Method | Endpoint        | Description                  | Authentication |
| ------ | --------------- | ---------------------------- | -------------- |
| GET    | `/products`     | Get all products (paginated) | Required       |
| GET    | `/products/:id` | Get a specific product       | Required       |
| POST   | `/products`     | Create a new product         | Required       |
| PATCH  | `/products/:id` | Update a product             | Required       |
| DELETE | `/products/:id` | Delete a product             | Required       |

### Query Parameters

For the `GET /products` endpoint:

| Parameter | Type   | Default | Max | Description                        |
| --------- | ------ | ------- | --- | ---------------------------------- |
| page      | number | 1       | -   | Page number (1-based)              |
| limit     | number | 10      | 100 | Number of items per page           |
| category  | string | -       | -   | Filter by category (partial match) |
| tags      | string | -       | -   | Filter by tags (comma-separated)   |

**Example URLs:**

- `/products` - First page with 10 items
- `/products?page=2` - Second page with 10 items
- `/products?limit=25` - First page with 25 items
- `/products?page=3&limit=20` - Third page with 20 items
- `/products?category=Electronics` - Filter by Electronics category
- `/products?tags=gaming,portable` - Filter by gaming OR portable tags
- `/products?category=Electronics&tags=gaming&page=2` - Combined filters with pagination

**Note**: All product endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

## Authentication

### JWT Token Usage

After successful login or registration, you'll receive a JWT token that must be included in the `Authorization` header for all protected routes:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- **Default expiration**: 24 hours
- **Configurable**: Set `JWT_EXPIRES_IN` in environment variables
- **Refresh**: Use `/auth/refresh` endpoint to get a new token

## Data Models

### User Entity

```typescript
{
  id: string; // UUID (auto-generated)
  email: string; // User email (unique, required)
  firstName: string; // User first name (required)
  lastName: string; // User last name (required)
  isActive: boolean; // Account status (default: true)
  createdAt: Date; // Creation timestamp (auto-generated)
  updatedAt: Date; // Last update timestamp (auto-updated)
}
```

### Register User DTO

```typescript
{
  email: string; // Valid email address (required)
  password: string; // Strong password (required, min 8 chars)
  firstName: string; // First name (required, 2-50 chars)
  lastName: string; // Last name (required, 2-50 chars)
}
```

### Login DTO

```typescript
{
  email: string; // User email (required)
  password: string; // User password (required)
}
```

### Product Entity

```typescript
{
  id: string;          // UUID (auto-generated)
  name: string;        // Product name (required)
  description?: string; // Product description (optional)
  price: number;       // Product price (required)
  category?: string;   // Product category (optional)
  tags?: string[];     // Product tags array (optional)
  createdAt: Date;     // Creation timestamp (auto-generated)
  updatedAt: Date;     // Last update timestamp (auto-updated)
}
```

### Create Product DTO

```typescript
{
  name: string;        // Required, must be a string
  description?: string; // Optional string
  price: number;       // Required number
  category?: string;   // Optional string
  tags?: string[];     // Optional array of strings
}
```

### Update Product DTO

```typescript
{
  name?: string;       // Optional string
  description?: string; // Optional string
  price?: number;      // Optional number
  category?: string;   // Optional string
  tags?: string[];     // Optional array of strings
}
```

## Request/Response Examples

### Authentication Examples

#### 1. Register User

**POST** `/auth/register`

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**

```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

#### 2. Login User

**POST** `/auth/login`

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

#### 3. Get User Profile

**GET** `/auth/profile`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Profile retrieved successfully"
}
```

### Product Examples (Authentication Required)

#### 1. Create Product

**POST** `/products`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Laptop",
  "description": "High-performance gaming laptop",
  "price": 1299.99,
  "category": "Electronics",
  "tags": ["gaming", "portable", "high-performance"]
}
```

**Response (201 Created):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Laptop",
  "description": "High-performance gaming laptop",
  "price": 1299.99,
  "category": "Electronics",
  "tags": ["gaming", "portable", "high-performance"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### 2. Get All Products (Paginated & Filtered)

**GET** `/products?page=1&limit=10&category=Electronics&tags=gaming`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Laptop",
      "description": "High-performance gaming laptop",
      "price": 1299.99,
      "category": "Electronics",
      "tags": ["gaming", "portable", "high-performance"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "name": "Mouse",
      "description": "Wireless gaming mouse",
      "price": 79.99,
      "category": "Accessories",
      "tags": ["wireless", "gaming", "ergonomic"],
      "createdAt": "2024-01-15T11:15:00.000Z",
      "updatedAt": "2024-01-15T11:15:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Pagination Metadata:**

- `total`: Total number of products in database
- `page`: Current page number
- `limit`: Number of items per page
- `totalPages`: Total number of pages available
- `hasNextPage`: Whether there are more pages after current
- `hasPrevPage`: Whether there are pages before current

#### 3. Get Product by ID

**GET** `/products/123e4567-e89b-12d3-a456-426614174000`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Laptop",
  "description": "High-performance gaming laptop",
  "price": 1299.99,
  "category": "Electronics",
  "tags": ["gaming", "portable", "high-performance"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### 4. Update Product

**PATCH** `/products/123e4567-e89b-12d3-a456-426614174000`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**

```json
{
  "price": 1199.99,
  "description": "High-performance gaming laptop - On Sale!",
  "tags": ["gaming", "portable", "high-performance", "sale"]
}
```

**Response (200 OK):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Laptop",
  "description": "High-performance gaming laptop - On Sale!",
  "price": 1199.99,
  "category": "Electronics",
  "tags": ["gaming", "portable", "high-performance", "sale"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T14:45:00.000Z"
}
```

#### 5. Delete Product

**DELETE** `/products/123e4567-e89b-12d3-a456-426614174000`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "message": "Product deleted successfully"
}
```

## Error Handling

### Authentication Error Responses

#### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Authentication required",
  "error": "Unauthorized"
}
```

#### 401 Invalid Token

```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

#### 401 Token Expired

```json
{
  "statusCode": 401,
  "message": "Token has expired",
  "error": "Unauthorized"
}
```

#### 409 User Already Exists

```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

### Common Error Responses

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "Name cannot be empty",
    "price must be a number",
    "Price must be greater than 0",
    "tags must be an array",
    "each value in tags must be a string"
  ],
  "error": "Bad Request"
}
```

#### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Product with ID \"123e4567-e89b-12d3-a456-426614174000\" not found",
  "error": "Not Found"
}
```

#### 400 Invalid UUID

```json
{
  "statusCode": 400,
  "message": "Validation failed (uuid is expected)",
  "error": "Bad Request"
}
```

### HTTP Status Codes

| Code | Description                    |
| ---- | ------------------------------ |
| 200  | Success                        |
| 201  | Created                        |
| 400  | Bad Request (validation error) |
| 401  | Unauthorized (authentication)  |
| 403  | Forbidden (authorization)      |
| 404  | Not Found                      |
| 409  | Conflict (duplicate resource)  |
| 500  | Internal Server Error          |

## Filtering Details

### Category Filtering

- **Parameter**: `category` (string)
- **Behavior**: Case-insensitive partial match
- **Example**: `category=electron` matches "Electronics", "Electronic Devices", etc.

### Tags Filtering

- **Parameter**: `tags` (comma-separated string)
- **Behavior**: OR logic - matches products with ANY of the specified tags
- **Case-insensitive**: `tags=GAMING` matches products with "gaming" tag
- **Multiple tags**: `tags=gaming,portable,wireless` matches products with gaming OR portable OR wireless tags
- **Partial matching**: `tags=game` matches products with "gaming" tag

### Combined Filtering

- All filters work together with AND logic
- Category AND tags filters are applied together
- Filters work with pagination
- Empty results return standard pagination structure

## Pagination Details

### Default Behavior

- **Default page**: 1
- **Default limit**: 10 items per page
- **Maximum limit**: 100 items per page
- **Sort order**: Newest products first (by `createdAt`)

### Query Parameters Validation

- `page` must be a positive integer (≥ 1)
- `limit` must be a positive integer (≥ 1, ≤ 100)
- Invalid values will return 400 Bad Request

### Empty Results

When no products exist or page is beyond available data:

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

## Validation Rules

### Product Name

- Required
- Must be a string
- Cannot be empty or just whitespace
- Validation: `@IsString()` and `@IsNotEmpty()`

### Product Description

- Optional
- Must be a string if provided

### Product Price

- Required
- Must be a number
- Must be greater than 0 (positive)

### Product Category

- Optional
- Must be a string if provided
- Used for organizing products into categories

### Product Tags

- Optional
- Must be an array of strings if provided
- Used for tagging products with relevant keywords

### Product ID (for updates/deletes)

- Must be a valid UUID format

### User Registration

#### Email

- Must be a valid email format
- Must be unique in the system
- Cannot be empty

#### Password

- Minimum 8 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number
- Must contain at least one special character (@$!%\*?&)

#### Names (firstName, lastName)

- Minimum 2 characters
- Maximum 50 characters
- Cannot be empty

### Timestamps

- `createdAt`: Automatically set when a product is created
- `updatedAt`: Automatically updated whenever a product is modified
- Both timestamps are in ISO 8601 format (UTC)

## Testing with cURL

### Authentication Examples

#### Register a new user

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Login user

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

#### Get user profile

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Product Examples (with authentication)

#### Create a product

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 99.99,
    "category": "Test Category",
    "tags": ["test", "sample"]
  }'

# Example with validation error (empty name)
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "description": "Product with empty name",
    "price": 99.99
  }'

# Example with validation error (negative price and invalid tags)
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid Product",
    "price": -10.50,
    "category": "",
    "tags": "invalid-tags-should-be-array"
  }'
```

**Note**: The response will include automatically generated `createdAt` and `updatedAt` timestamps.

#### Get all products (with pagination and filtering)

```bash
# Get first page (default: 10 items)
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Get specific page
curl -X GET http://localhost:3000/products?page=2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Get with custom page size
curl -X GET http://localhost:3000/products?limit=25 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Get specific page with custom size
curl -X GET http://localhost:3000/products?page=3&limit=20 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Filter by category
curl -X GET http://localhost:3000/products?category=Electronics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Filter by tags (OR logic)
curl -X GET http://localhost:3000/products?tags=gaming,portable \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Combined filters with pagination
curl -X GET "http://localhost:3000/products?category=Electronics&tags=gaming,wireless&page=2&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Case-insensitive partial matching
curl -X GET http://localhost:3000/products?category=electron&tags=GAME \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Get a specific product

```bash
curl -X GET http://localhost:3000/products/{product-id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Update a product

```bash
curl -X PATCH http://localhost:3000/products/{product-id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "price": 89.99,
    "category": "Updated Category",
    "tags": ["updated", "discounted"]
  }'
```

**Note**: The `updatedAt` timestamp will be automatically updated to reflect the modification time.

#### Delete a product

```bash
curl -X DELETE http://localhost:3000/products/{product-id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run start

# Build for production
npm run build
```

## Database Schema

The application uses TypeORM with PostgreSQL. The database schema is automatically synchronized in development mode.

### Products Table

| Column      | Type          | Constraints                 |
| ----------- | ------------- | --------------------------- |
| id          | UUID          | PRIMARY KEY, AUTO-GENERATED |
| name        | VARCHAR       | NOT NULL                    |
| description | TEXT          | NULLABLE                    |
| price       | DECIMAL(10,2) | NOT NULL, CHECK > 0         |
| category    | VARCHAR       | NULLABLE                    |
| tags        | TEXT          | NULLABLE (comma-separated)  |
| createdAt   | TIMESTAMP     | NOT NULL, AUTO-GENERATED    |
| updatedAt   | TIMESTAMP     | NOT NULL, AUTO-UPDATED      |

### Users Table

| Column    | Type      | Constraints                 |
| --------- | --------- | --------------------------- |
| id        | UUID      | PRIMARY KEY, AUTO-GENERATED |
| email     | VARCHAR   | NOT NULL, UNIQUE            |
| password  | VARCHAR   | NOT NULL (hashed)           |
| firstName | VARCHAR   | NOT NULL                    |
| lastName  | VARCHAR   | NOT NULL                    |
| isActive  | BOOLEAN   | DEFAULT TRUE                |
| createdAt | TIMESTAMP | NOT NULL, AUTO-GENERATED    |
| updatedAt | TIMESTAMP | NOT NULL, AUTO-UPDATED      |

## Environment Variables

| Variable       | Description        | Default         |
| -------------- | ------------------ | --------------- |
| DB_HOST        | Database host      | localhost       |
| DB_PORT        | Database port      | 5432            |
| DB_USERNAME    | Database username  | postgres        |
| DB_PASSWORD    | Database password  | password        |
| DB_NAME        | Database name      | product_db      |
| NODE_ENV       | Environment        | development     |
| PORT           | Application port   | 3000            |
| JWT_SECRET     | JWT signing secret | your-secret-key |
| JWT_EXPIRES_IN | Token expiration   | 24h             |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
