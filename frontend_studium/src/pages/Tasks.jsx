import { useEffect, useState, useCallback, useMemos } from 'react';
import { useUserStore } from '../store/UserStore.jsx';
import { projectApi } from '../api/project.jsx';
import { useTechnologiesStore } from '../store/TechnologiesStore.jsx'
import { useProjectCategoryStore } from '../store/ProjectCategoryStore.jsx'
import TaskCard from '../components/TaskCard.jsx'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'   

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
					<TaskCard project={task} />
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

	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCategories, setSelectedCategories] = useState([])
	const [selectedTechnologies, setSelectedTechnologies] = useState([])

	const [isLoading, setIsLoading] = useState(false)

	const fetchProjects = async (overrideParams = null) => {
		setIsLoading(true)
		try {
			const params = new URLSearchParams()

			const search = overrideParams ? overrideParams.search : searchTerm
			const categories = overrideParams ? overrideParams.categories : selectedCategories
			const technologies = overrideParams ? overrideParams.technologies : selectedTechnologies

			if (search) {
				params.append('search', search)
			}

			if (categories.length > 0) {
				categories.forEach(category => {
					params.append('category_id', category)
				})
			}

			if (technologies.length > 0) {
				technologies.forEach(technology => {
					params.append('technologies_id', technology)
				})
			}

			const data = await projectApi.fetchProjects(params.toString())
			setProjects(data)

		// const response = await fetch (`/api/project_exchange/?${params.toString()}`, {
		// 	method: 'GET',
		// 	headers: {
		// 		'accept': 'application/json',
		// 		'Authorization': `Basic ${user}`
		// 		}
		// 	})
		// 	if (response.ok) {
		// 		const data = await response.json()
		// 		setProjects(data)
		// 	}
		} catch (error) {
		}
		setIsLoading(false)
	}

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value)
	}

	const handleCategoryChange = (category) => {
		setSelectedCategories(prev => {
			if (prev.includes(category)) {
				return prev.filter(id => id !== category)
			} else {
				return [...prev, category]
			}
		})
	}

	const handleTechnologyChange = (technology) => {
		setSelectedTechnologies(prev => {
			if (prev.includes(technology)) {
				return prev.filter(id => id !== technology)
			} else {
				return [...prev, technology]
			}
		})
	}

	const resetFilters = () => {
		setSearchTerm('')
		setSelectedCategories([])
		setSelectedTechnologies([])

		fetchProjects({ search: '', categories: [], technologies: [] })
	}

	const applyFilters = (e) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			fetchProjects()
		}
	}

	const applyFiltersButton = (e) => {
		e.preventDefault()
		fetchProjects()
	}

	useEffect(() => {
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
								<input 
									type="checkbox" 
									name="category" 
									id={`category${category.id}`} 
									checked={selectedCategories.includes(category.id)}
									onChange={() => handleCategoryChange(category.id)}
									className="peer absolute left-0 -z-1 opacity-0 checked:bg-gray-600" 
								/>
								<label htmlFor={`category${category.id}`} className="cursor-pointer px-3 md:px-2.5 py-1.5 rounded-[50px] font-normal text-base inline-block relative mb-0 bg-gray-200 hover:bg-gray-300 peer-checked:bg-white peer-checked:outline-2 peer-checked:outline-green-600">
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
								<input 
									type="checkbox" 
									name="technology" 
									id={`technology${technology.id}`} 
									checked={selectedTechnologies.includes(technology.id)}
									onChange={() => handleTechnologyChange(technology.id)}
									className="peer absolute left-0 -z-1 opacity-0 checked:bg-gray-600" 
								/>
								<label htmlFor={`technology${technology.id}`} className="cursor-pointer px-3 md:px-2.5 py-1.5 rounded-[50px] font-normal text-base inline-block relative mb-0 bg-gray-200 hover:bg-gray-300 peer-checked:bg-white peer-checked:outline-2 peer-checked:outline-green-600">
									{technology.name}
								</label>
							</div>
						))}
					</div>
				</div>
				<div className="text-lg flex flex-col gap-5">
					<button 
						className='w-full px-3.5 text-center py-2 text-white bg-green-700 hover:bg-green-800 cursor-pointer rounded-md'
						onClick={applyFiltersButton}
					>
						Применить фильтр
					</button>
					<div 
						className="cursor-pointer border-b pb-0.5 text-sm self-center w-fit"
						onClick={resetFilters}
					>
						Сбросить настройки фильтра
					</div>
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
						<input 
							value={searchTerm}
							onChange={handleSearchChange}
							className='outline-0 self-end px-2.5 py-2' 
							type="text" 
							placeholder='Искать проект...' 
							size='25' 
							onKeyDown={applyFilters}
						/>
						<div className="px-2.5 py-2 cursor-pointer" onClick={applyFilters}>
						🔍
						</div>
					</div>
				</div>
				{isLoading ? (
					<div className="flex flex-col gap-5">
						{[1, 2, 3].map(i => (
							<div key={i} className="border border-gray-200 rounded-md p-7.5">
								<Skeleton height={24} width="60%" className="mb-6" />
								<div className="flex gap-5 mb-6">
									<Skeleton height={40} width={150} />
									<Skeleton height={40} width={150} />
								</div>
								<Skeleton height={16} count={1} className="mb-6" />
								<div className="flex gap-1.25 mb-6">
									<Skeleton width={120} height={32} />
									<Skeleton width={120} height={32} />
								</div>
							</div>
						))}
					</div>
				): (
					<div className="">
						<ProjectsContent projects={projects} />
					</div>
				)}
			</div>           
        </div>
    )
}

export default Tasks