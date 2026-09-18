import React from 'react';

const RoleBadge = ({ role }) => {
  if (!role) return null;
  const roleLower = role.toLowerCase();

  const getBadgeClass = () => {
    switch (roleLower) {
      case 'admin':
        return 'badge-admin';
      case 'vendor':
        return 'badge-vendor';
      case 'customer':
        return 'badge-customer';
      default:
        return 'badge-warning';
    }
  };

  return (
    <span className={`badge ${getBadgeClass()}`}>
      {role}
    </span>
  );
};

export default RoleBadge;
