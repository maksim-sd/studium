import { useUser } from "../userContext";

function RoleSwitcher() {
  const { user, switchRole } = useUser();

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
        <span>{user.name}</span>
        <span>▼</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg hidden group-hover:block">
        <button 
          onClick={() => switchRole('student')}
          className="w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          Студент
        </button>
        <button 
          onClick={() => switchRole('customer')}
          className="w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          Заказчик
        </button>
        <button 
          onClick={() => switchRole('moderator')}
          className="w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          Модератор
        </button>
      </div>
    </div>
  );
}

export default RoleSwitcher