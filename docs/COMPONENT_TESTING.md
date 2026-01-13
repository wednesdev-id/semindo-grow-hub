# Component Testing Guide

## SearchInput Component

### Manual Testing Checklist

**Basic Functionality**:
- [ ] Type in search box - value updates
- [ ] Debounce works (onChange called after 300ms)
- [ ] Clear button appears when text is entered
- [ ] Clear button clears the input
- [ ] Loading indicator shows during debounce
- [ ] ESC key clears the input

**Edge Cases**:
- [ ] Rapid typing doesn't cause multiple onChange calls
- [ ] Empty string handled correctly
- [ ] Special characters work
- [ ] Very long strings handled

**Accessibility**:
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Clear button has aria-label

---

## CategoryFilter Component

### Manual Testing Checklist

**Basic Functionality**:
- [ ] Categories load from API
- [ ] "All Categories" option present
- [ ] Selecting category triggers onChange
- [ ] Product counts display correctly (if enabled)
- [ ] Loading state shows while fetching

**Edge Cases**:
- [ ] API failure handled gracefully
- [ ] Empty category list handled
- [ ] Category with 0 count displays correctly

**Accessibility**:
- [ ] Select is keyboard accessible
- [ ] Focus states visible
- [ ] Disabled state during loading

---

## Integration Testing

### SearchInput + CategoryFilter
- [ ] Both components work together
- [ ] State management works correctly
- [ ] No race conditions between debounce and category change

### ProductFilters Integration
- [ ] SearchInput integrates with ProductFilters
- [ ] CategoryFilter integrates with ProductFilters
- [ ] All filters work together harmoniously

---

## Browser Compatibility

**Desktop**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile**:
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Samsung Internet

---

## Performance Testing

**SearchInput**:
- [ ] Debounce prevents excessive API calls
- [ ] No memory leaks on unmount
- [ ] Smooth typing experience

**CategoryFilter**:
- [ ] Categories cached after first load
- [ ] Dropdown opens/closes smoothly
- [ ] No lag with many categories (100+)
