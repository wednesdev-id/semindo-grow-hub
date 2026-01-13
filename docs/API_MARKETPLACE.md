# Marketplace API Documentation

## Overview
This document describes the marketplace search and filter API endpoints for different user roles.

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Public Endpoints

### Search Products
**Endpoint**: `GET /api/v1/marketplace/search`

**Description**: Search and filter products with pagination.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search term for product title/description |
| category | string | No | Filter by category |
| minPrice | number | No | Minimum price filter |
| maxPrice | number | No | Maximum price filter |
| stockStatus | string | No | Filter by stock status (in_stock, low_stock, out_of_stock) |
| sortBy | string | No | Sort option (price_asc, price_desc, newest, popular) |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |

**Response**:
```json
{
  "products": [
    {
      "id": "uuid",
      "title": "Product Name",
      "slug": "product-slug",
      "price": "50000",
      "category": "Craft",
      "stock": 10,
      "status": "active",
      "isPublished": true,
      "images": ["url1", "url2"],
      "store": {
        "name": "Store Name",
        "rating": "4.5"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## Seller Endpoints

### Get My Products
**Endpoint**: `GET /api/v1/marketplace/my-products`

**Description**: Get products owned by the authenticated seller with filters.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search in product titles |
| category | string | No | Filter by category |
| stockStatus | string | No | Filter by stock status |
| sortBy | string | No | Sort option |
| minPrice | number | No | Minimum price |
| maxPrice | number | No | Maximum price |

**Response**: Same as search endpoint

---

## Admin Endpoints

### Get All Products (Admin)
**Endpoint**: `GET /api/v1/marketplace/admin/products`

**Description**: Get all products from all sellers including drafts and unpublished items.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search term |
| category | string | No | Filter by category |
| status | string | No | Filter by status (active, draft, archived) |
| sellerId | string | No | Filter by specific seller |
| sortBy | string | No | Sort option |
| page | number | No | Page number |
| limit | number | No | Items per page |

**Response**:
```json
{
  "products": [...],
  "pagination": {...}
}
```

---

## Consultant Endpoints

### Get Client Products
**Endpoint**: `GET /api/v1/marketplace/consultant/clients/products`

**Description**: Get products from consultant's assigned clients.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search term |
| clientId | string | No | Filter by specific client |
| status | string | No | Filter by status |
| page | number | No | Page number |
| limit | number | No | Items per page |

**Response**: Same structure as other endpoints

---

## Partner Endpoints

### Get Export Ready Products
**Endpoint**: `GET /api/v1/marketplace/partner/opportunities`

**Description**: Get products that meet export-ready criteria.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by category |
| region | string | No | Filter by region/city |
| page | number | No | Page number |
| limit | number | No | Items per page |

**Response**: Same structure with additional export-ready indicators

---

## Bank Endpoints

### Get Financing Candidates
**Endpoint**: `GET /api/v1/marketplace/bank/candidates`

**Description**: Get stores eligible for financing based on performance metrics.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| minRevenue | number | No | Minimum estimated revenue |
| location | string | No | Filter by location |
| page | number | No | Page number |
| limit | number | No | Items per page |

**Response**:
```json
{
  "candidates": [
    {
      "id": "uuid",
      "name": "Store Name",
      "owner": "Owner Name",
      "location": "City",
      "orderCount": 150,
      "estimatedRevenue": 22500000,
      "status": "Eligible"
    }
  ],
  "pagination": {...}
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**:
```json
{
  "error": "Invalid parameters"
}
```

**401 Unauthorized**:
```json
{
  "error": "Authentication required"
}
```

**404 Not Found**:
```json
{
  "error": "Not Found",
  "path": "/api/v1/marketplace/..."
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error"
}
```
