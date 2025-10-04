# Sidebar Permission Implementation Guide

This guide shows how to apply permission checks to all sidebar menu items based on the user's `menuList` from the login response.

## Implementation Pattern

### 1. Simple Menu Items (Direct Links)
For menu items that don't have submenus, add `*ngIf="hasPermission(ID)"`:

```html
<li class="nav-item" id="1" *ngIf="hasPermission(1)">
  <a class="nav-link" [routerLink]="['/home']" routerLinkActive="active">
    <i class="fas fa-home"></i>
    <span>{{ 'HOME.TITLE' | translate }}</span>
  </a>
</li>
```

### 2. Parent Menu Items with Submenus
For parent menu items, use `*ngIf="hasAnyChildPermission([child1, child2, child3])"`:

```html
<li class="nav-item" id="72" *ngIf="hasAnyChildPermission([33, 70, 111])">
  <div [routerLink]="['/attendance']">
    <a class="nav-link" (click)="toggleSubmenu('attendance')" [class.expanded]="isSubmenuOpen('attendance')">
      <i class="fa-regular fa-check-square"></i>
      <span class="ps-1">{{ 'MENU.ATTENDANCE_DATA' | translate }}</span>
      <i class="ms-auto fas fa-chevron-down submenu-arrow"></i>
    </a>
  </div>
  <ul class="nav flex-column submenu ps-3" [class.show]="isSubmenuOpen('attendance')">
    <li id="33" *ngIf="hasPermission(33)">...</li>
    <li id="70" *ngIf="hasPermission(70)">...</li>
    <li id="111" *ngIf="hasPermission(111)">...</li>
  </ul>
</li>
```

### 3. Nested Submenus (3+ levels)
For deeply nested menus, continue the same pattern:

```html
<li id="183" *ngIf="hasAnyChildPermission([53, 75, 83, 128, 106, 156, 160, 164])">
  <div [routerLink]="['/primary-data/general-data']" routerLinkActive="active">
    <a class="pe-3 nav-link" (click)="toggleSubmenu('generalData')" [class.expanded]="isSubmenuOpen('generalData')">
      <i class="fas fa-database"></i>
      <span>{{ 'MENU.PRIMARY_DATA_SECTIONS.GENERAL_DATA' | translate }}</span>
      <i class="ms-auto fas fa-chevron-down submenu-arrow"></i>
    </a>
  </div>
  <ul class="nav flex-column nested-submenu" [class.show]="isSubmenuOpen('generalData')">
    <li id="53" *ngIf="hasPermission(53)">...</li>
    <li id="75" *ngIf="hasPermission(75)">...</li>
    <!-- etc -->
  </ul>
</li>
```

## Complete Menu ID Mapping

Based on the sidebar.component.html, here are all the menu IDs that need permission checks:

### Top Level Items:
- 1: Home (الرئيسية)
- 100: Dashboard (الرسومات البيانية)
- 35: View Attendance (مشاهدة الحضور)
- 2: Mawjood App (تطبيق موجود)
- 99: Reports (التقارير)

### Attendance Data (بيانات الحضور) - Parent should check [33, 70, 111]:
- 33: Punch Transactions
- 70: Attendance
- 111: Change Attendance Time

### Shifts (فترات الدوام) - Parent should check [78, 39, 23, 121, 259]:
- 78: Shifts
- 39: Automatic Sign
- 23: Shifts Assign
- 121: Missing Days
- 259: Timtran Lock

### Vacation Tasks (الاجازات والمهام) - Parent should check [113, 11, 43, 65, 117, 205]:
- 113: Attendance Status Classifications
- 11: Attendance Statuses
- 43: Handle Statuses Priority
- 65: Days Handle
- 117: Handle Statuses Employee Balance
- 205: My Balance

### Requests and Approvals (الطلبات و الموافقات) - Parent should check [41, 51, 132, 97, 102, 108]:
- 41: Steps to Approve Changing Time
- 51: Attendance Time Change Request
- 132: Post Request
- 97: Request Approval Route
- 102: Request Approval Vacations
- 108: Delete Completed Request

### Tracking Locations (تتبع المواقع) - Parent should check [145, 146]:
- 145: Location Tracking Details
- 146: Location Tracking Transactions

### Mobile and App (الجوال و التطبيق) - Parent should check [133, 13, 29, 122, 130, 96]:
- 133: Mawjood App
- 13: Send App QR Code
- 29: App Devices
- 122: Mobile Sign Location Assign
- 130: Mobile Sign Transaction
- 96: Mobile Sign Locations

### Salaries (الرواتب) - Parent should check [103, 105, 119, 131, 120]:
- 103: Salary Add Deducts
- 105: Salary Add Ons Deducts
- 119: Salaries Calculation
- 131: My Salary
- 120: Salaries Details

### Primary Data (البيانات الاساسية) - Complex nested structure:
- General Data (البيانات العامه) - Check [53, 75, 83, 128, 106, 156, 160, 164]:
  - 53: Branches
  - 75: Departments
  - 83: Employees
  - 128: Nationalities
  - 106: Banks
  - 156: Cities
  - 160: Organization
  - 164: Province

- Mawjood Data (بيانات موجود) - Check [95, 104, 107]:
  - 95: Employee Statuses
  - 104: Jobs
  - 107: Employee Documents

- CTS Data (بيانات الاتصالات الادارية) - Check [151, 153, 155, 157, 158, 159, 161, 163, 165, 166, 167, 168, 169, 170, 253, 263, 269, 279]:
  - And many more IDs...

### Messages and Notifications (الرسائل والاشعارات) - Parent should check [27, 101, 124, 98, 126]:
- 27: System Messages
- 101: Notifications Text
- 124: News
- 98: Send Notifications
- 126: Notifications Settings

### Permission Management (ادارة الصلاحيات) - Complex nested structure
### Audit and Tracing (التدقيق و المتابعة)

## How to Apply to Remaining Items

1. For each `<li>` element, identify its `id` attribute
2. Add `*ngIf="hasPermission(ID)"` for direct menu items
3. Add `*ngIf="hasAnyChildPermission([child1, child2, ...])"` for parent items
4. List all child IDs in the array for parent permission checks

This ensures that:
- Users only see menu items they have permission for
- Parent menus are visible if any child has permission
- The UI is clean and shows only relevant options
- Security is enforced at the UI level (backend should also validate)