# Test Suite for JupyterLab Data Viewer

This directory contains comprehensive test suites for the jupyter-data-viewer extension.

## Test Structure

### Unit Tests
- API client service tests
- Data service tests
- Component tests

### Integration Tests
- End-to-end data flow tests
- Mock data processing tests

### Mock Data
- Sample CSV, TSV, JSON and Parquet files for testing

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- path/to/test-file.ts
```

## Test Categories

1. **API Client Tests**: Verify the API client correctly communicates with backend
2. **Data Service Tests**: Test data processing and service layer functionality
3. **Component Tests**: Validate React component rendering and behavior
4. **Integration Tests**: End-to-end flow testing between frontend and backend
5. **Data Processing Tests**: Verify file type support and data structure expectations
