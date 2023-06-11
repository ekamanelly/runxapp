import { PermissionAlias } from './perm-role.interface';

export const PERMISSIONS = [
  {
    name: 'View Dashboard',
    alias: PermissionAlias['VIEW_DASHBOARD'],
    active: false,
  },
  {
    name: 'View Service Manager',
    alias: PermissionAlias['VIEW_SERVICE_MANAGER'],
    active: false,
  },
  {
    name: 'View Service Type',
    alias: PermissionAlias['VIEW_SERVICE_TYPE'],
    active: false,
  },
  {
    name: 'Create Service Type',
    alias: PermissionAlias['CREATE_SERVICE_TYPE'],
    active: false,
  },
  {
    name: 'Update Service Type',
    alias: PermissionAlias['UPDATE_SERVICE_TYPE'],
    active: false,
  },
  {
    name: 'Delete Service Type',
    alias: PermissionAlias['DELETE_SERVICE_TYPE'],
    active: false,
  },
  {
    name: 'Delete User',
    alias: PermissionAlias['DELETE_USER'],
    active: false,
  },
  {
    name: 'Deactivate User',
    alias: PermissionAlias['DEACTIVATE_USER'],
    active: false,
  },
  {
    name: 'ActivateUser User',
    alias: PermissionAlias['ACTIVATEUSER_USER'],
    active: false,
  },
  {
    name: 'Debit User',
    alias: PermissionAlias['DEBIT_USER'],
    active: false,
  },
  {
    name: 'View User',
    alias: PermissionAlias['VIEW_USER'],
    active: false,
  },
  {
    name: 'View Admin logs',
    alias: PermissionAlias['VIEW_ADMIN_LOGS'],
    active: false,
  },
  {
    name: 'Create Admin',
    alias: PermissionAlias['CREATE_ADMIN'],
    active: false,
  },
  {
    name: 'Delete Admin',
    alias: PermissionAlias['DELETE_ADMIN'],
    active: false,
  },
  {
    name: 'Update Admin',
    alias: PermissionAlias['UPDATE_ADMIN'],
    active: false,
  },
  {
    name: 'View Admin',
    alias: PermissionAlias['VIEW_ADMIN'],
    active: false,
  },
  {
    name: 'View Admin Details',
    alias: PermissionAlias['VIEW_ADMIN_DETAILS'],
    active: false,
  },
  {
    name: 'Create Notification',
    alias: PermissionAlias['CREATE_NOTIFICATION'],
    active: false,
  },
  {
    name: 'View Dispute List',
    alias: PermissionAlias['VIEW_DISPUTE_LIST'],
    active: false,
  },
  {
    name: 'Resolve Dispute',
    alias: PermissionAlias['RESOLVE_DISPUTE'],
    active: false,
  },
  {
    name: 'View Finance Analytics',
    alias: PermissionAlias['VIEW_FINANCE_ANALYTICS'],
    active: false,
  },
  {
    name: 'View Finance List',
    alias: PermissionAlias['VIEW_FINANCE_LIST'],
    active: false,
  },
];
