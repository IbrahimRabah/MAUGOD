export const routePermissionMap: { [key: string]: number[] } = {
  '/home': [1],
  '/dashboard': [100],
  '/mobile-and-app/mawjood-app': [2, 133],
  '/reports': [99],
  '/system-management/user-profile': [125],

  // Attendance Data
  '/attendance': [33, 70, 111],
  '/attendance/punch-in-transactions': [33],
  '/attendance/view-attendance': [35, 70],
  '/attendance/change-attendance-time': [111],

  // Shifts Section
  '/shifts-section': [78, 39, 23, 121, 259],
  '/shifts-section/shifts': [78],
  '/shifts-section/automatic-sign': [39],
  '/shifts-section/shifts-assign': [23],
  '/shifts-section/missing-days': [121],
  '/shifts-section/timtran-lock': [259],

  // Vacation & Tasks
  '/vacation-tasks': [113, 11, 43, 65, 117, 205],
  '/vacation-tasks/attendance-status-classifications': [113],
  '/vacation-tasks/attendance-statuses': [11],
  '/vacation-tasks/handle-statuses-priority': [43],
  '/vacation-tasks/days-handle': [65],
  '/vacation-tasks/handle-statuses-employee-balance': [117],
  '/vacation-tasks/my-balance': [205],

  // Requests & Approvals
  '/requests-and-approvals': [41, 51, 132, 97, 102, 108],
  '/requests-and-approvals/steps-to-approve-changing-time': [41],
  '/requests-and-approvals/attendance-time-change-request': [51],
  '/requests-and-approvals/post-request': [132],
  '/requests-and-approvals/request-approval-route': [97],
  '/requests-and-approvals/request-approval-vacations': [102],
  '/requests-and-approvals/delete-completed-request': [108],

  // Tracking Locations
  '/tracking-locations': [145, 146],
  '/tracking-locations/location-tracking-details': [145],
  '/tracking-locations/location-tracking-transactions': [146],

  // Mobile & App
  '/mobile-and-app': [133, 13, 29, 122, 130, 96],
  '/mobile-and-app/send-app-qr-code': [13],
  '/mobile-and-app/app-devices': [29],
  '/mobile-and-app/mobile-sign-location-assign': [122],
  '/mobile-and-app/mobile-sign-transaction': [130],
  '/mobile-and-app/mobile-sign-locations': [96],

  // Salaries
  '/salaries': [103, 105, 119, 131, 120],
  '/salaries/salary-add-deducts': [103],
  '/salaries/salary-add-ons-deducts': [105],
  '/salaries/salaries-calculation': [119],
  '/salaries/my-salary': [131],
  '/salaries/salaries-details': [120],

  // Primary Data → General Data
  '/primary-data': [53, 75, 83, 128, 106, 156, 160, 164, 95, 104, 107, 151, 153, 155, 157, 158, 159, 161, 163, 165, 166, 167, 168, 169, 170, 253, 263, 269, 279, 188, 195, 187, 196, 197, 198, 211],
  'primary-data/general-data': [53, 75, 83, 128, 106, 156, 160, 164],
  '/primary-data/branches': [53],
  '/primary-data/departments': [75],
  '/primary-data/employees': [83],
  '/primary-data/nationalities': [128],
  '/primary-data/banks': [106],
  '/primary-data/cities': [156],
  '/primary-data/organization': [160],
  '/primary-data/province': [164],

  // Primary Data → Mawjood Data
  '/primary-data/mawjood-data': [95, 104, 107],
  '/primary-data/employees-statuses': [95],
  '/primary-data/jobs': [104],
  '/primary-data/employees-documents': [107],

  // Primary Data → CTS Data
  '/primary-data/cts-data': [151, 153, 155, 157, 158, 159, 161, 163, 165, 166, 167, 168, 169, 170, 253, 263, 269, 279],
  '/primary-data/action': [151],
  '/primary-data/position': [153],
  '/primary-data/my-list': [155],
  '/primary-data/document-template': [157],
  '/primary-data/delivery-mode': [158],
  '/primary-data/document-type': [159],
  '/primary-data/keywords': [161],
  '/primary-data/priority-level': [163],
  '/primary-data/security-level': [165],
  '/primary-data/subject-class': [166],
  '/primary-data/document-color': [167],
  '/primary-data/transaction-status': [168],
  '/primary-data/urgency-level': [169],
  '/primary-data/approval-routes': [170],
  '/primary-data/all-data': [253],
  '/primary-data/parallel-document': [263],
  '/primary-data/security-policy': [269],
  '/primary-data/masar-application': [279],
  
  // Primary Data → committees Data
  '/primary-data/committees-data': [188, 195, 187, 196, 197, 198, 211],
  '/primary-data/committees': [188],
  '/primary-data/committee-members': [195],
  '/primary-data/committee-invitations': [187],
  '/primary-data/committee-route': [196],
  '/primary-data/committee-subject-classes': [197],
  '/primary-data/voting-types': [198],
  '/primary-data/meeting-and-subjects': [211],

  // messages-and-notifications
  '/messages-and-notifications': [27, 101, 124, 98, 126],
  '/messages-and-notifications/system-messages': [27],
  '/messages-and-notifications/notifications-text': [101],
  '/messages-and-notifications/news': [124],
  '/messages-and-notifications/send-notifications': [98],
  '/messages-and-notifications/notifications-settings': [126],

  //permission-managements
  '/permission-managements': [77, 81, 85, 89, 91, 59, 73, 92, 93, 3, 5, 37, 136],

  '/permission-managements/premissions-on-system': [77, 81, 85, 89, 91],
  '/permission-managements/user-roles': [77],
  '/permission-managements/user-role-assignment': [81],
  '/permission-managements/role-chart-rights': [85],
  '/permission-managements/role-module-rights': [89],
  '/permission-managements/role-report-rights': [91],


  '/permission-managements/basic-system-items': [59, 73, 92, 93],
  '/permission-managements/charts-list': [59],
  '/permission-managements/report-list': [73],
  '/permission-managements/system-menus': [92],
  '/permission-managements/system-modules': [93],


  '/permission-managements/permission-on-data': [3, 5, 37, 136],
  '/permission-managements/access-permissions': [3],
  '/permission-managements/access-permissions-summary': [5],
  '/permission-managements/request-post-premisions': [37],
  '/permission-managements/permissions-delegations': [136],

  //audit-and-tracing
  '/audit-and-tracing': [115, 63, 114, 109],
  '/audit-and-tracing/track-changes': [115],
  '/audit-and-tracing/login-trace': [63],
  '/audit-and-tracing/error-logs': [114],
  '/audit-and-tracing/tables-trace-settings': [109],

  //system-management
  '/system-management': [19, 49, 55, 125, 123],
  '/system-management/system-setup': [19],
  '/system-management/hijri-data': [49],
  '/system-management/language-data': [55],
  '/system-management/sessions-management': [123],

  //consorship
  '/consorship': [230, 232, 233],
  '/consorship/tour-available': [230],
  '/consorship/tour-unavailable': [232],
  '/consorship/alarms': [233]

};
