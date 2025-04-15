// Временная реализация хука useAuth
export const useAuth = () => {
  return {
    isAuthenticated: false,
    user: null,
    login: async () => {},
    logout: async () => {},
  };
};
