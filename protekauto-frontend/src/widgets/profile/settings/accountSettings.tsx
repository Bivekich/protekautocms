import React from 'react';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone: string;
}

interface AccountSettingsProps {
  profile?: UserProfile;
  onSave?: (profile: UserProfile) => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  profile = { phone: '' },
  onSave,
}) => {
  const [formData, setFormData] = React.useState<UserProfile>(profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <div className="account-settings">
      <h2>Настройки аккаунта</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">Имя</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="lastName">Фамилия</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="phone">Телефон</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled
          />
        </div>
        <button type="submit">Сохранить</button>
      </form>
    </div>
  );
};
