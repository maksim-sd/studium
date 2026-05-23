import { useEffect, useState } from 'react';
import { useUserStore } from '../store/UserStore.jsx';
import { useTechnologiesStore } from '../store/TechnologiesStore.jsx'
import { useProjectCategoryStore } from '../store/ProjectCategoryStore.jsx';
import TaskCard from '../components/TaskCard.jsx'

function ProjectsContent ({ projects }) {
	if (projects.length === 0) {
		return (
			<div className="flex flex-col items-cemter text-center gap-5">
				<div className="text-xl ">
				    На данный момент доступных проектов нет
				</div>
				<div className="">
					Попробуйте позже
				</div>
			</div>
		)
	} else {
		return (
			<div className="flex flex-col gap-5">
				{projects.map((task) => (
					<TaskCard task={task} />
				))}
			</div>
		)
	}
}

function Tasks () {
	const user = useUserStore((state) => state.currentUser)
	const technologies = useTechnologiesStore((state) => state.technologies)
	const categories = useProjectCategoryStore((state) => state.categories)

	const [projects, setProjects] = useState([])

  // const technologies = [
  //       'Node.js',
  //       'Django',
  //       'Python',
  //       'REST API',
  //       'Android',
  //       'HTML5',
  //       '1C',
  //       'C#',
  //       'IOS',
  //       'CSS',
  //       'React',
  //       'Java'
  //   ]

//   const tasks = [
//     {
//       id: 1,
//       title: "Разработка дашборда аналитики продаж",
//       description: "Разработать адаптивный веб-интерфейс для отображения ключевых метрик (KPI) отдела продаж. Необходимо реализовать динамические графики на основе библиотеки Chart.js, получающие данные через REST API. Бэкенд должен предоставлять эндпоинты для фильтрации данных по дате (сегодня, неделя, месяц) и категориям товаров. Обязательно наличие авторизации через JWT-токены и ролевой модели (администратор видит всё, менеджер — только свой отдел).",
//       author: "Алексей Иванов",
//       technologies: ["React", "Chart.js", "Node.js", "PostgreSQL", "JWT"],
//       category: "Веб-программирование",
//       date_of_publication: "2024-03-15",
//       points_reward: 500,
//       money_reward: 0
//     },
//     {
//       id: 2,
//       title: "Создание лендинга для IT-конференции с формой обратной связи",
//       description: "Сверстать промо-страницу конференции 'DevMeet 2024' по методологии Pixel Perfect. Реализовать валидацию формы регистрации участников на чистом JavaScript (проверка email, маска телефона) без перезагрузки страницы. Настроить отправку данных в БД (PostgreSQL) через PHP-скрипт с защитой от SQL-инъекций. Добавить административную панель для просмотра списка зарегистрированных участников с возможностью экспорта в CSV.",
//       author: "Мария Петрова",
//       technologies: ["HTML/CSS", "JavaScript", "PHP", "PostgreSQL", "CSV"],
//       category: "Веб-программирование",
//       date_of_publication: "2024-03-18",
//       points_reward: 300,
//       money_reward: 8000
//     },
//     {
//       id: 3,
//       title: "Мобильное приложение 'Трекер привычек'",
//       description: "Создать кроссплатформенное приложение (React Native) для отслеживания ежедневных привычек. Архитектура: MVVM. Пользователь должен иметь возможность создавать привычки с установкой периодичности (ежедневно, по будням, раз в неделю), отмечать их выполнение через календарь и просматривать статистику успеваемости в виде графика 'Стрик' (непрерывная серия). Локальное хранение данных организовать через SQLite, синхронизацию с облаком (Firebase) — для бэкапа.",
//       author: "Дмитрий Соколов",
//       technologies: ["React Native", "SQLite", "Firebase", "MVVM"],
//       category: "Мобильная разработка",
//       date_of_publication: "2024-03-20",
//       points_reward: 600,
//       money_reward: 20000
//     },
//     {
//       id: 4,
//       title: "Разработка нативного приложения для сканирования чеков",
//       description: "Реализовать приложение под Android (Kotlin) с использованием камеры для сканирования QR-кодов и штрихкодов товаров. При распознавании кода необходимо отправлять запрос к внешнему API (Open Food Facts) и отображать детальную информацию о продукте (состав, калорийность). Вести историю сканирований в Room Database с возможностью добавления ручных заметок к каждому отсканированному товару.",
//       author: "Елена Волкова",
//       technologies: ["Kotlin", "CameraX", "Room Database", "REST API", "Open Food Facts"],
//       category: "Мобильная разработка",
//       date_of_publication: "2024-03-22",
//       points_reward: 550,
//       money_reward: 18000
//     },
//     {
//       id: 5,
//       title: "Проектирование схемы БД для онлайн-кинотеатра",
//       description: "Спроектировать реляционную базу данных для сервиса потокового видео. Написать скрипты создания таблиц (пользователи, подписки, фильмы, актеры, история просмотров) с учетом нормализации до 3НФ. Создать индексы для ускорения поиска по названию и жанру. Реализовать сложные хранимые процедуры: `sp_get_recommendations` (подбор фильмов по истории просмотров) и триггер для автоматического списания оплаты за подписку в последний день месяца.",
//       author: "Сергей Михайлов",
//       technologies: ["PostgreSQL", "SQL", "PL/pgSQL"],
//       category: "Создание и администрирование БД",
//       date_of_publication: "2024-03-25",
//       points_reward: 450,
//       money_reward: 12000
//     },
//     {
//       id: 6,
//       title: "Миграция данных и оптимизация запросов (NoSQL)",
//       description: "Разработать структуру документов для MongoDB в логистической системе. Необходимо хранить информацию о заказах (вложенные массивы товаров), статусах доставки и геолокации курьеров. Написать скрипт миграции (ETL) для переноса 100k+ записей из старой MySQL-базы в новую коллекцию MongoDB с преобразованием схемы. Составить сложные агрегационные запросы (aggregation pipeline) для расчета средней скорости доставки по районам города за последний квартал.",
//       author: "Андрей Козлов",
//       technologies: ["MongoDB", "MySQL", "Python", "ETL", "Aggregation Pipeline"],
//       category: "Создание и администрирование БД",
//       date_of_publication: "2024-03-27",
//       points_reward: 500,
//       money_reward: 16000
//     },
//     {
//       id: 7,
//       title: "Разработка АРМ менеджера по работе с клиентами",
//       description: "Разработать автоматизированное рабочее место для менеджера отдела продаж, работающего с базой клиентов компании. АРМ должен представлять собой десктопное веб-приложение (SPA) с ролевой моделью, обеспечивающее полный цикл работы с клиентской базой: просмотр, поиск, фильтрацию, редактирование карточек клиентов, добавление комментариев и задач. Включает дашборд руководителя с графиками по конверсии воронки продаж, план/факт по заключенным сделкам за месяц.",
//       author: "Ольга Новикова",
//       technologies: ["React/Vue.js", "Django REST Framework", "PostgreSQL", "JWT", "Redux/Pinia"],
//       category: "Веб-программирование",
//       date_of_publication: "2024-03-29",
//       points_reward: 700,
//       money_reward: 25000
//     },
//     {
//       id: 8,
//       title: "Разработка АРМ администратора технической поддержки (Service Desk)",
//       description: "Разработать автоматизированное рабочее место для сотрудников технической поддержки IT-компании. Система должна обеспечить полный цикл обработки заявок (инцидентов и запросов) от пользователей: регистрацию обращения, назначение ответственного, отслеживание статусов, эскалацию, фиксацию решения и опрос удовлетворенности. Включает модуль SLA и эскалации, базу знаний, дашборд с аналитикой и опрос удовлетворенности.",
//       author: "Максим Дмитриев",
//       technologies: ["Vue 3", "TypeScript", "FastAPI", "PostgreSQL", "Redis", "Celery", "WebSockets"],
//       category: "Веб-программирование",
//       date_of_publication: "2024-04-01",
//       points_reward: 800,
//       money_reward: 30000
//     }
//   ];

	useEffect(() => {
		async function fetchProjects() {
			const response = await fetch(`/api/project_exchange/`, {
				method: 'GET',
				headers: {
					'Authorization': `Basic ${user}`
				}
			})
			if (response.ok) {
				const data = await response.json()
				setProjects(data)
			}
		}
        fetchProjects()
	}, [])

    return (
        <div className="mx-5 md:mx-62.5 flex gap-7.5">
			<div className="max-w-83.25 basis-1/4 sticky top-25 self-start p-5 pt-0 flex flex-col gap-7.5">
				<div className="flex flex-col gap-1.25">
					<div className="text-lg font-medium mb-2.5">
						Тип проекта:
					</div>
					<div className="flex flex-wrap gap-1.25">
						{categories.map((category) => (
							<div className="relative block">
								<input type="checkbox" name="technology" id={category.id} className="peer absolute left-0 -z-1 opacity-0 checked:bg-gray-600" />
								<label htmlFor={category.id} className="cursor-pointer px-3 md:px-2.5 py-1.5 rounded-[50px] font-normal text-base inline-block relative mb-0 bg-gray-200 hover:bg-gray-300 peer-checked:bg-white peer-checked:outline-2 peer-checked:outline-green-600">
								{ category.name }
								</label>
							</div>
						))}
					</div>
				</div>
				<div className="flex flex-col gap-2.5 text-lg font-medium">
					Стек технологий:
					<div className="flex gap-2 flex-wrap">
						{technologies.map((technology) => (
							<div className="relative block">
								<input type="checkbox" name="technology" id={`technology${technology.id}`} className="peer absolute left-0 -z-1 opacity-0 checked:bg-gray-600" />
								<label htmlFor={`technology${technology.id}`} className="cursor-pointer px-3 md:px-2.5 py-1.5 rounded-[50px] font-normal text-base inline-block relative mb-0 bg-gray-200 hover:bg-gray-300 peer-checked:bg-white peer-checked:outline-2 peer-checked:outline-green-600">
									{technology.name}
								</label>
							</div>
						))}
					</div>
				</div>
				<div className="text-lg">
					<button className='w-full px-3.5 text-center py-2 text-white bg-green-700 hover:bg-green-800 cursor-pointer rounded-md'>
						Применить фильтр
					</button>
				</div>
			</div>
			<div className="basis-3/4">
				<div className="flex justify-end mb-6.25 focus:outline-red-600">
					<div className="flex bg-white outline outline-gray-400 rounded-md focus-within:outline-green-600">
						{/* <label class="relative inline-flex items-center cursor-pointer">
						<input type="checkbox" className="sr-only peer" />
						<div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1.75 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
						<span className="ml-3 text-sm text-gray-900">Показать задания с денежным вознаграждением</span>
						</label> */}
						<input className='outline-0 self-end px-2.5 py-2' type="text" placeholder='Искать проект...' size='25' />
						<div className="px-2.5 py-2 cursor-pointer">
						🔍
						</div>
					</div>
				</div>
				<div className="">
					<ProjectsContent projects={projects} />
				</div>
			</div>           
        </div>
    )
}

export default Tasks