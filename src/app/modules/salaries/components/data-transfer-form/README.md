## Data Transfer Form Component

This component provides a form for transferring data between different entities in the system. It follows the same design patterns and styling as the salaries-calculation component.

### Features

1. **Radio Button Selection**: Choose from 6 different transfer types:
   - Employee (موظف)
   - Manager of Department (مدير قسم)
   - Department (قسم)
   - Manager of Branch (مدير فرع)
   - Branch (فرع)
   - Role (دور)

2. **Dynamic Dropdown Lists**: Based on the selected transfer type, appropriate dropdown lists are populated from the `DropdownlistsService`:
   - `getEmpsDropdownList()` - for employees
   - `getManagersDropdownList()` - for department managers
   - `getDepartmentsDropdownList()` - for departments
   - `getBranchManagersDropdownList()` - for branch managers (newly added)
   - `getBranchesDropdownList()` - for branches
   - `getEmployeeRolesDropdownList()` - for roles

3. **Multi-Select for Target Employees**: Uses the same beautiful multi-select component style as the salaries-calculation component, allowing users to:
   - Search through employees
   - Select/deselect individual employees
   - Select all/clear all employees
   - View selected count

4. **Form Structure**: Matches the requested JSON structure:
   ```json
   {
     "fromEmpId": 0,
     "fromMgrOfDeptId": 0,
     "fromDeptId": 0,
     "fromMgrOfBranchId": 0,
     "fromBranchId": 0,
     "fromRoleId": 0,
     "toEmpId": [0],
     "changeDataEmp": 0,
     "sDate": "2025-08-09T12:55:54.713Z",
     "eDate": "2025-08-09T12:55:54.713Z",
     "note": "string"
   }
   ```

### Usage

1. **Route Access**: Navigate to `/salaries/data-transfer`

2. **In Template**:
   ```html
   <app-data-transfer-form></app-data-transfer-form>
   ```

3. **Programmatic Access**:
   ```typescript
   // In your component, inject the component or use ViewChild
   @ViewChild(DataTransferFormComponent) dataTransferForm!: DataTransferFormComponent;
   
   // Open the modal
   openDataTransferModal() {
     this.dataTransferForm.openModal();
   }
   ```

### API Integration

To complete the integration, you'll need to:

1. **Create a Service**: Create a service that handles the actual data transfer submission:
   ```typescript
   submitDataTransfer(requestBody: any, lang: number): Observable<any> {
     // Implementation for API call
   }
   ```

2. **Update the Component**: Replace the console.log in `submitForm()` method with actual service call:
   ```typescript
   // Replace this line in submitForm():
   console.log('Data Transfer Request Body:', requestBody);
   
   // With:
   this.dataTransferService.submitDataTransfer(requestBody, this.currentLang).subscribe({
     next: (response) => {
       this.showSuccessMessage('تم نقل البيانات بنجاح');
       this.closeModal();
     },
     error: () => {
       this.showErrorMessage('فشل في نقل البيانات');
     }
   });
   ```

### New Service Method Added

A new method was added to `DropdownlistsService`:

```typescript
getBranchManagersDropdownList(lang: number): Observable<any> {
  const headers = new HttpHeaders({
    'lang': lang.toString()
  });

  console.log('Calling branch managers API:', `${this.apiUrl}/Branches/GetBranchManagersDropdownList`);
  return this.http.get<any>(
    `${this.apiUrl}/Branches/GetBranchManagersDropdownList`,
    { headers }
  );
}
```

### Styling

The component uses the exact same styling approach as the salaries-calculation component, including:
- Beautiful gradient headers
- Smooth animations
- RTL/LTR support
- Responsive design
- PrimeNG integration for toasts and confirmations
- Custom multi-select with search functionality
- Radio buttons with custom styling
- Form validation with error messages

### Files Created

1. `data-transfer-form.component.ts` - Main component logic
2. `data-transfer-form.component.html` - Template with RTL support
3. `data-transfer-form.component.css` - Styling matching salaries-calculation
4. Updated `salaries.module.ts` - Added component declaration
5. Updated `salaries-routing.module.ts` - Added routing
6. Updated `dropdownlists.service.ts` - Added branch managers method
