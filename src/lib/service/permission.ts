export let _permissions: any[] = [
  {
    listname: 'Default',
    Manager: { Read: true, Add: true, Edit: true, Delete: true },
    User: { Read: true, Add: false, Edit: false, Delete: false },
    Viewer: { Read: true, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Delivery',
    Manager: { Read: true, Add: true, Edit: true, Delete: true },
    User: { Read: true, Add: true, Edit: true, Delete: false },
    Viewer: { Read: true, Add: false, Edit: true, Delete: false },
  },
  {
    listname: 'Product',
    Manager: { Read: true, Add: true, Edit: true, Delete: true },
    User: { Read: true, Add: false, Edit: false, Delete: false },
    Viewer: { Read: true, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Itemgroup',
    Manager: { Read: true, Add: true, Edit: true, Delete: true },
    User: { Read: true, Add: false, Edit: false, Delete: false },
    Viewer: { Read: true, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Address',
    Manager: { Read: true, Add: true, Edit: true, Delete: true },
    User: { Read: true, Add: true, Edit: true, Delete: false },
    Viewer: { Read: true, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Stock',
    Manager: { Read: true, Add: true, Edit: false, Delete: false },
    User: { Read: true, Add: true, Edit: false, Delete: false },
    Viewer: { Read: true, Add: true, Edit: false, Delete: false },
  },
  {
    listname: 'User',
    Manager: { Read: true, Add: false, Edit: false, Delete: false },
    User: { Read: false, Add: false, Edit: false, Delete: false },
    Viewer: { Read: false, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Pushnotification',
    Manager: { Read: true, Add: true, Edit: true, Delete: true },
    User: { Read: true, Add: false, Edit: false, Delete: true },
    Viewer: { Read: true, Add: false, Edit: false, Delete: true },
  },
  {
    listname: 'Verify',
    Manager: { Read: false, Add: false, Edit: false, Delete: false },
    User: { Read: false, Add: false, Edit: false, Delete: false },
    Viewer: { Read: false, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Counter',
    Manager: { Read: true, Add: false, Edit: false, Delete: false },
    User: { Read: true, Add: false, Edit: false, Delete: false },
    Viewer: { Read: true, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Config',
    Manager: { Read: true, Add: false, Edit: false, Delete: false },
    User: { Read: true, Add: false, Edit: false, Delete: false },
    Viewer: { Read: true, Add: false, Edit: false, Delete: false },
  },
  {
    listname: 'Comment',
    Manager: { Read: true, Add: true, Edit: true, Delete: false },
    User: { Read: true, Add: true, Edit: false, Delete: false },
    Viewer: { Read: true, Add: false, Edit: false, Delete: false },
  },
  /*
    {
      listname: 'Post',
      Manager: { Read: true, Add: true, Edit: true, Delete: true },
      User: { Read: true, Add: false, Edit: false, Delete: false },
      Viewer: { Read: true, Add: false, Edit: false, Delete: false },
    },
    {
      listname: 'Page',
      Manager: { Read: true, Add: true, Edit: true, Delete: true },
      User: { Read: true, Add: false, Edit: false, Delete: false },
      Viewer: { Read: true, Add: false, Edit: false, Delete: false },
    },
    {
      listname: 'Tag',
      Manager: { Read: true, Add: true, Edit: true, Delete: true },
      User: { Read: true, Add: false, Edit: false, Delete: false },
      Viewer: { Read: true, Add: false, Edit: false, Delete: false },
    }, // */
];

export const setPermissions = (permission: any[]) => {
  _permissions = permission;
};

/**
 * Permission.
 */
export enum Permission {
  Read = 1,
  Add = 2,
  Edit = 3,
  Remove = 4,
}
