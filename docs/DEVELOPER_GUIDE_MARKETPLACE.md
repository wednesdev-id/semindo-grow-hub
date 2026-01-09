# Marketplace Search & Filter - Developer Guide

## Architecture Overview

The marketplace search and filter system is built with a layered architecture:

```
Frontend (React/TypeScript)
    ↓
Service Layer (marketplaceService.ts)
    ↓
API Layer (Express.js)
    ↓
Controller Layer (marketplace.controller.ts)
    ↓
Service Layer (marketplace.service.ts)
    ↓
Database Layer (Prisma ORM)
```

---

## Key Components

### Frontend Components

#### ProductFilters Component
**Location**: `src/components/marketplace/ProductFilters.tsx`

**Purpose**: Reusable filter UI component with Sheet (popup) interface

**Props**:
```typescript
interface ProductFiltersProps {
  filters: {
    category: string;
    minPrice: number;
    maxPrice: number;
    stockStatus: string;
    sortBy: string;
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
}
```

**Usage**:
```tsx
<ProductFiltersComponent
  filters={filters}
  onFilterChange={handleFilterChange}
  onReset={handleResetFilters}
/>
```

#### Dashboard Components
- `SellerDashboard.tsx`: Seller product management
- `AdminDashboard.tsx`: Admin product oversight
- `ConsultantDashboard.tsx`: Client product monitoring
- `PartnerDashboard.tsx`: Export opportunity discovery
- `BankDashboard.tsx`: Financing candidate identification

---

## Backend Architecture

### Service Layer Pattern

All marketplace operations follow this pattern:

```typescript
// 1. Define parameters interface
interface SearchParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// 2. Build Prisma where clause
const where: Prisma.ProductWhereInput = {
  deletedAt: null,
  isPublished: true
};

if (params.search) {
  where.OR = [
    { title: { contains: params.search, mode: 'insensitive' } },
    { description: { contains: params.search, mode: 'insensitive' } }
  ];
}

// 3. Execute query with pagination
const [products, total] = await Promise.all([
  prisma.product.findMany({ where, skip, take, orderBy }),
  prisma.product.count({ where })
]);

// 4. Return with pagination metadata
return {
  products,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
};
```

---

## Adding New Filters

### 1. Update Backend Service

**File**: `api/src/systems/marketplace/services/marketplace.service.ts`

```typescript
// Add new filter parameter
async searchProducts(params: {
  // ... existing params
  newFilter?: string;
}) {
  const { newFilter } = params;
  
  // Add to where clause
  if (newFilter) {
    where.newField = newFilter;
  }
  
  // ... rest of query
}
```

### 2. Update Controller

**File**: `api/src/systems/marketplace/controllers/marketplace.controller.ts`

```typescript
async searchProducts(req: Request, res: Response) {
  const { newFilter } = req.query;
  
  const params = {
    // ... existing params
    newFilter: newFilter ? String(newFilter) : undefined
  };
  
  const result = await marketplaceService.searchProducts(params);
  res.json(result);
}
```

### 3. Update Frontend Service

**File**: `src/services/marketplaceService.ts`

```typescript
searchProducts: async (params: {
  // ... existing params
  newFilter?: string;
}) => {
  const queryParams = new URLSearchParams();
  
  // ... existing params
  if (params.newFilter) {
    queryParams.append('newFilter', params.newFilter);
  }
  
  const response = await api.get(`/marketplace/search?${queryParams}`);
  return response;
}
```

### 4. Update UI Component

**File**: `src/components/marketplace/ProductFilters.tsx`

```tsx
// Add to state
const [newFilter, setNewFilter] = useState('');

// Add UI control
<select
  value={newFilter}
  onChange={(e) => setNewFilter(e.target.value)}
>
  <option value="">All</option>
  <option value="value1">Option 1</option>
</select>

// Include in filter object
const handleApply = () => {
  onFilterChange({
    ...filters,
    newFilter
  });
};
```

---

## Adding New User Roles

### 1. Create Service Method

```typescript
async getRoleSpecificProducts(roleId: string, params: FilterParams) {
  const where: Prisma.ProductWhereInput = {
    // Role-specific filtering logic
  };
  
  // Standard query pattern
  const [products, total] = await Promise.all([...]);
  
  return { products, pagination: {...} };
}
```

### 2. Create Controller Method

```typescript
async getRoleSpecificProducts(req: Request, res: Response) {
  const roleId = (req as any).user.id;
  const params = this.parseQueryParams(req.query);
  
  const result = await marketplaceService.getRoleSpecificProducts(roleId, params);
  res.json(result);
}
```

### 3. Register Route

**File**: `api/src/systems/marketplace/routes/marketplace.routes.ts`

```typescript
router.get('/role/products', authenticate, controller.getRoleSpecificProducts);
```

### 4. Create Frontend Service

```typescript
getRoleProducts: async (filters?: FilterParams) => {
  const queryParams = new URLSearchParams();
  // Build query params
  
  const response = await api.get(`/marketplace/role/products?${queryParams}`);
  return response;
}
```

### 5. Create Dashboard Component

```tsx
export default function RoleDashboard() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  
  useEffect(() => {
    const fetchProducts = async () => {
      const { products } = await marketplaceService.getRoleProducts(filters);
      setProducts(products);
    };
    
    fetchProducts();
  }, [filters]);
  
  return (
    // Dashboard UI
  );
}
```

---

## Performance Optimization

### Database Indexes

**File**: `api/prisma/migrations/add_marketplace_indexes.sql`

Add indexes for frequently queried fields:
```sql
CREATE INDEX "Product_field_idx" ON "Product"("field");
```

### Query Optimization

1. **Use `select` to limit returned fields**:
```typescript
prisma.product.findMany({
  select: {
    id: true,
    title: true,
    price: true
    // Only fields you need
  }
});
```

2. **Avoid N+1 queries with `include`**:
```typescript
prisma.product.findMany({
  include: {
    store: {
      select: { name: true }
    }
  }
});
```

3. **Use pagination**:
```typescript
const skip = (page - 1) * limit;
prisma.product.findMany({ skip, take: limit });
```

### Frontend Optimization

1. **Debouncing**: Already implemented for search inputs
2. **Memoization**: Use `useMemo` for expensive computations
3. **Lazy Loading**: Consider for images and large lists

---

## Testing

### Backend Testing

```typescript
describe('MarketplaceService', () => {
  it('should filter products by category', async () => {
    const result = await marketplaceService.searchProducts({
      category: 'Craft'
    });
    
    expect(result.products).toBeDefined();
    expect(result.products.every(p => p.category === 'Craft')).toBe(true);
  });
});
```

### Frontend Testing

```typescript
describe('ProductFilters', () => {
  it('should call onFilterChange when filters applied', () => {
    const onFilterChange = jest.fn();
    
    render(<ProductFilters onFilterChange={onFilterChange} />);
    
    // Interact with filters
    fireEvent.click(screen.getByText('Apply Filters'));
    
    expect(onFilterChange).toHaveBeenCalled();
  });
});
```

---

## Common Patterns

### Error Handling

```typescript
try {
  const result = await marketplaceService.searchProducts(params);
  res.json(result);
} catch (error: any) {
  console.error('Search error:', error);
  res.status(400).json({ error: error.message });
}
```

### Pagination Response

```typescript
return {
  products: [...],
  pagination: {
    total: 100,
    page: 1,
    limit: 20,
    totalPages: 5
  }
};
```

### Filter State Management

```typescript
const [filters, setFilters] = useState({
  search: '',
  category: '',
  minPrice: 0,
  maxPrice: 100000000
});

const handleFilterChange = (newFilters: any) => {
  setFilters(prev => ({ ...prev, ...newFilters }));
};
```

---

## Troubleshooting

### Common Issues

1. **404 on new endpoints**: Server needs restart after route changes
2. **Filters not working**: Check query parameter parsing in controller
3. **Slow queries**: Add database indexes, check for N+1 queries
4. **Type errors**: Ensure Prisma schema is up to date (`npx prisma generate`)

### Debugging Tips

1. **Backend**: Add console.log in service methods to see query params
2. **Frontend**: Use React DevTools to inspect state
3. **Network**: Check browser Network tab for API requests/responses
4. **Database**: Use Prisma Studio to inspect data (`npx prisma studio`)

---

## Best Practices

1. **Always use server-side filtering** for scalability
2. **Implement pagination** for all list endpoints
3. **Use TypeScript interfaces** for type safety
4. **Add indexes** for frequently queried fields
5. **Debounce search inputs** to reduce API calls
6. **Handle empty states** gracefully in UI
7. **Provide loading states** for better UX
8. **Log errors** for debugging
9. **Document new endpoints** in API docs
10. **Write tests** for critical functionality

---

## Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **React Query**: Consider for advanced caching
- **TypeScript**: https://www.typescriptlang.org/docs
- **Express.js**: https://expressjs.com/

---

## Contributing

When adding new features:
1. Follow the existing architecture patterns
2. Update this documentation
3. Add tests for new functionality
4. Update API documentation
5. Consider performance implications
6. Review with team before merging
