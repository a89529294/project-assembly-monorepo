export const userKey = "tanstack.auth.user";
export const sessionTokenKey = "tanstack.auth.session.token";
export const baseURL = import.meta.env.VITE_API_BASE_URL;

export const generateHeaders = () => {
  const token = localStorage.getItem(sessionTokenKey);
  console.log(token);
  return token
    ? { Authorization: `Bearer ${token}` }
    : ({} as Record<string, never>);
};
