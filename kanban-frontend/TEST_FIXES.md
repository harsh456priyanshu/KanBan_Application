# Test Script - CSI_LMS Kanban Application

## Testing All Fixes

### 1. Backend Testing

#### Start Backend Server
```bash
cd "kanban-backend"
npm install
npm start
```

**Expected Result:** Server should start on port 5000 without errors

#### Test MongoDB Connection
- Check console for "Connected to MongoDB" message
- If connection fails, verify MongoDB Atlas connection string

#### Test API Endpoints
```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Frontend Testing

#### Start Frontend Server
```bash
cd "kanban-frontend"
npm install
npm run dev
```

**Expected Result:** Frontend should start on http://localhost:5173

#### Test Responsive Design
1. **Mobile View (320px-768px)**
   - Test sidebar toggle
   - Test login/register forms
   - Test dashboard layout
   - Test board cards in mobile view

2. **Tablet View (768px-1024px)**
   - Test sidebar behavior
   - Test grid layouts
   - Test navigation

3. **Desktop View (1024px+)**
   - Test full sidebar
   - Test all features
   - Test responsive grid

#### Test User Authentication
1. **Registration**
   - Navigate to /register
   - Fill out form with valid data
   - Submit form
   - Should redirect to login

2. **Login**
   - Navigate to /login
   - Use registered credentials
   - Should redirect to dashboard

#### Test Board Creation
1. **Create Board**
   - Click "Create Board" button
   - Fill in board name and description
   - Submit form
   - Should see new board in dashboard

2. **View Board**
   - Click on created board
   - Should navigate to board view (if implemented)

### 3. Responsive UI Testing

#### Mobile-First Testing
- [ ] Login page responsive
- [ ] Register page responsive
- [ ] Dashboard responsive
- [ ] Sidebar mobile menu works
- [ ] Board cards stack properly on mobile
- [ ] Forms work on mobile
- [ ] Navigation works on mobile

#### Tablet Testing
- [ ] Sidebar collapses appropriately
- [ ] Grid layouts adjust properly
- [ ] All interactive elements work
- [ ] Forms remain usable

#### Desktop Testing
- [ ] Full sidebar functionality
- [ ] All features accessible
- [ ] Responsive grid systems work
- [ ] No horizontal scrolling

### 4. Error Handling Testing

#### Test Error Scenarios
1. **Invalid Login**
   - Try login with wrong credentials
   - Should show error message

2. **Network Errors**
   - Turn off backend server
   - Try to create board
   - Should show appropriate error

3. **Form Validation**
   - Submit empty forms
   - Should show validation errors

### 5. Performance Testing

#### Load Testing
- Create multiple boards
- Test scrolling performance
- Test sidebar toggle performance
- Test modal open/close performance

### 6. Cross-Browser Testing

#### Test In Different Browsers
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

### 7. Accessibility Testing

#### Check Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast is adequate
- [ ] Focus indicators are visible

## Expected Results Summary

✅ **Backend should:**
- Start without module errors
- Connect to MongoDB successfully
- Handle API requests properly
- Provide proper error messages

✅ **Frontend should:**
- Be fully responsive on all devices
- Handle authentication properly
- Create boards successfully
- Display boards correctly
- Work smoothly on mobile devices

✅ **Overall Application should:**
- Work seamlessly across all screen sizes
- Provide good user experience
- Handle errors gracefully
- Be fast and responsive

## Troubleshooting

### Common Issues and Solutions

1. **Board creation fails**
   - Check MongoDB connection
   - Verify authentication token
   - Check network requests in browser dev tools

2. **UI not responsive**
   - Clear browser cache
   - Check CSS classes are applied
   - Verify Tailwind CSS is working

3. **Authentication issues**
   - Check token storage in localStorage
   - Verify API endpoints are correct
   - Check CORS settings

4. **Mobile layout issues**
   - Test on actual mobile device
   - Use browser responsive mode
   - Check media queries are working
