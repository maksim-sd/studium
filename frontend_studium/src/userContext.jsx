import { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    role: 'student', 
    name: 'Студент',
  });

  const switchRole = (role) => {
    const roles = {
      student: { name: 'Студент', role: 'student' },
      customer: { name: 'Заказчик', role: 'customer' },
      moderator: { name: 'Модератор', role: 'moderator' }
    };
    setUser(roles[role]);
  };

  return (
    <UserContext.Provider value={{ user, switchRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);