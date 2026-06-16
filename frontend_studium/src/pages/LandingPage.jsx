import { useEffect, useState, useRef } from 'react'
import { IMaskInput } from 'react-imask'
import Marquee from 'react-fast-marquee'
import { toast } from 'react-toastify'
import mentor from '../assets/mentor.png'
import place from '../assets/place.png'
import phone from '../assets/phone.png'
import mail from '../assets/mail.png'
import pic from '../assets/pic.png'
import logo from '../assets/logo.png'
import micromine from '../assets/micromine.png'
import sber from '../assets/sber.png'
import chgma from '../assets/chgma.png'
import udokan from '../assets/udokan.png'
import zilstroy from '../assets/zilstroy.png'
import chitaenergo from '../assets/chitaenergo.png'


function LandingPageFirstSection() {
    return (
        <div className="flex pb-20">
            <div className="flex gap-10 relative">
                <div className="">
                    <div className="text-7xl font-semibold w-[70%]">
                        Создавайте ИТ-решения для бизнеса вместе с ЗабГУ!
                    </div>
                    <div className="text-xl w-[50%] pt-10 leading-9">
                        Публикуйте задачи Вашего бизнеса на онлайн-платформе ЗабГУ и получайте готовые решения от лучших студентов!
                    </div>
                    <div className="cursor-pointer px-6 py-1.5 text-white font-semibold bg-green-700 hover:bg-green-800 rounded-md text-2xl w-fit mt-20">
                        <a href="#contact">Связаться с нами</a>
                    </div>
                </div>
                <div className="absolute left-200 w-200 h-120">
                    <img src={pic} alt="" className="hue-rotate-200 w-full h-full object-contain" />
                </div>
                {/* <div className="absolute -bottom-10 -right-25 w-100 h-100 bg-green-600 rounded-full blur-2xl opacity-75 -z-9"></div>
                <div className="absolute -bottom-30 left-250 w-50 h-50 bg-green-600 rounded-full blur-2xl opacity-75 -z-9"></div> */}
            </div>
        </div>
        
    )
}

function StepCard ({ text, index }) {
    return (
        <div className="flex-1 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-5">
            <div className="flex justify-center pb-5">
                <div className="flex size-20 items-center justify-center rounded-full bg-linear-to-br from-green-600 to-green-800 text-center text-6xl font-semibold text-white shadow-md">
                {index}
                </div>
            </div>
            <div className="text-lg text-gray-700 text-center">
                {text}
            </div>
        </div>
    )
}

function LandingPageSteps () {
    const steps = [
        'Сформулируйте задачу, которую необходимо решить',
        'Модератор платформы свяжется с Вами после анализа Вашей заявки',
        'Ваша заявка попадет в общий банк проектов и станет доступной для отклика студентов',
        'Участвуйте в выполнении проекта и создавайте идеальный продукт вместе с командой студентов и преподавателей',
        'После выполнения задачи студенты и преподаватели ЗабГУ передадут Вам результаты своей работы'
    ]
    return (
        <div className="">
            <div className="flex justify-between gap-10">
                {steps.map((step, index) => (
                    <StepCard text={step} index={index + 1} />
                ))}
            </div>
        </div>
    )
}

function LandingPageAdvantages () {
    return (
        <div className="flex flex-col gap-7.5 text-lg">
            <div className="flex gap-7.5">
                <div className="basis-1/3 outline-3 outline-green-600 rounded-md p-5 relative overflow-hidden shadow-sm shadow-green-700">
                    <div className="pb-5 font-semibold text-2xl">
                        Возможность наставничества
                    </div>
                    <div className="">
                        У Вас есть возможность самостоятельно регулировать процесс выполнения студентом задачи
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-green-600 rounded-full blur-2xl opacity-75 -z-9 hidden"></div>
                </div>
                <div className="basis-1/3 outline-3 outline-green-600 rounded-md p-5 relative overflow-hidden">
                    <div className="pb-5 font-semibold text-2xl">
                        Поиск талантов
                    </div>
                    <div className="">
                        Работа со студентами дает Вам возможность пообщаться с будущими специалистами и, возможно, нанять самых перспективных еще до того, как они выйдут на открытый рынок труда
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-green-600 rounded-full opacity-75 -z-9 hidden"></div>
                </div>
                <div className="basis-1/3 outline-3 outline-green-600 rounded-md p-5 relative overflow-hidden">
                    <div className="pb-5 font-semibold text-2xl">
                        Формирование HR-бренда
                    </div>
                    <div className="">
                        Повышайте узнаваемость своей организации среди студентов.
                    </div>
                </div>
            </div>
            <div className="flex gap-7.5">
                <div className="basis-1/2 outline-3 outline-green-600 rounded-md p-5 relative overflow-hidden">
                    <div className="pb-5 font-semibold text-2xl">
                        Программные решения без риска для бизнеса
                    </div>
                    <div className="">
                        Нет времени на разработку чат-бота или создания собственного бренд-бука? Доверьте решение стуентам, которые смогут выполнить данную работу в рамках курсовой или дипломной работы
                    </div>
                </div>
                <div className="basis-1/2 outline-3 outline-green-600 rounded-md p-5 relative overflow-hidden">
                    <div className="pb-5 font-semibold text-2xl">
                        Высокая мотивация студентов
                    </div>
                    <div className="">
                        Студенты Забайкальского государственного университета искренне вовлечены в решение бизнес-кейсов и готовы предлагалть нестандартные решения, так как это их первые реальные задачи
                    </div>
                </div>
            </div>
        </div>
    )
}

function LandingPageForm() {
    const [name, setName] = useState('')
    const [orgName, setOrgName] = useState('')
    const [email, setMail] = useState('')
    const [phoneNumber, setPhone] = useState('')

    const [isSubmitting, setIsSubmitting] = useState(false)

    const isContactProvided = email.trim() !== "" || phoneNumber.trim() !== ""
    const isFormValid = name.trim() !== "" && orgName.trim() !== "" && isContactProvided

    async function handleSubmit (e) {
        e.preventDefault()
        
        if (!isFormValid) return

        setIsSubmitting(true)

        try {
            toast.success("Форма успешно отправлена!")
            
            setName("")
            setOrgName("")
            setMail("")
            setPhone("")
        } catch (error) {
            toast.error("Ошибка при отправке")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div id='contact' className="bg-green-700 mx-62.5 rounded-md p-10">
            <div className="flex gap-10">
                <div className="basis-2/3 text-white">
                    <div className="text-5xl font-semibold leading-12.5">
                        Присоединяйтесь и воплощайте свои идеи вместе с ЗабГУ!
                    </div>
                    <div className="py-10 text-xl w-[75%] pb-25">
                            Заполните форму и наш специалист поможет Вам получить доступ к онлайн-платформе, либо можете связаться с нами самостоятельно!
                    </div>
                    <div className="flex flex-col gap-5">
                        <div className="text-2xl font-semibold">
                            Контакты
                        </div>
                        <div className="flex justify-between text-lg">
                            <div className="flex items-center text-center gap-2">
                                <img src={place} alt="" className='size-8' />
                                г. Чита, ул. Баргузинская, 49, ауд. 03-03
                            </div>
                            <div className="flex items-center text-center gap-2">
                                <img src={phone} alt="" className='size-6' />
                                41-73-12
                            </div>
                            <div className="flex items-center text-center gap-2">
                                <img src={mail} alt="" className='size-8' />
                                kafedra_PIM@mail.ru
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col w-full basis-1/3 gap-8 bg-white rounded-md p-5">
                    <form onSubmit={handleSubmit} className='flex flex-col gap-5 text-lg'>
                        
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Ваше имя <span className="text-red-500">*</span></label>
                            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className='bg-white rounded-md outline outline-gray-300 p-2 text-lg focus:outline-green-600' placeholder='Ваше имя' />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Наименование организации <span className="text-red-500">*</span></label>
                            <input required type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className='bg-white rounded-md outline outline-gray-300 p-2 focus:outline-green-600' placeholder='Наименование организации' />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Контакты (заполните хотя бы одно поле) <span className="text-red-500">*</span></label>
                            <div className={`mb-5 outline rounded-md flex flex-col gap-2 p-2 ${isContactProvided ? 'outline-green-600' : 'outline-amber-600'}`}>
                                <input type="email" value={email} onChange={(e) => setMail(e.target.value)} className='bg-white rounded-md outline outline-gray-300 p-2 focus:outline-green-600' placeholder='Электронная почта организации' />
                                <div className="flex items-center justify-between gap-2">
                                    <div className='grow bg-green-700 h-0.5'></div>
                                    <span className='text-center text-green-700 text-sm'>или</span>
                                    <div className='grow bg-green-700 h-0.5'></div>
                                </div>
                                <IMaskInput
                                    mask="+7 (000) 000-00-00"
                                    definitions={{ '#': /[1-9]/ }}
                                    unmask={false} 
                                    placeholder="Контактный номер телефона"
                                    lazy={true}
                                    className='bg-white rounded-md outline outline-gray-300 p-2 focus:outline-green-600'
                                    value={phoneNumber} onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            type='submit' 
                            disabled={!isFormValid || isSubmitting} 
                            className='bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md text-white py-3 cursor-pointer hover:bg-green-600 transition-colors'
                        >
                            <div className="text-xl font-semibold">
                                {isSubmitting ? 'Отправка...' : 'Отправить'}
                            </div>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

function LandingPageFooter () {
    return (
        <footer className="bg-green-700 text-white px-62.5 py-10">
            <div className="flex">
                <div className="basis-1/3">
                    <div className="">
                        
                    </div>
                </div>
                <div className="flex flex-col gap-5">
                    <div className="font-semibold text-2xl ">
                        Контакты
                    </div>
                    <div className="">
                        г. Чита, ул. Баргузинская, 49, ауд. 03-03
                    </div>
                    <div className="">
                        41-73-12
                    </div>
                    <div className="">
                        kafedra_PIM@mail.ru
                    </div>
                </div>
            </div>
        </footer>
    )
}

function LandingPage () {
    const companies = [
        { 
            name: "Удоканская медь", 
            logo: udokan,  
        },
        { 
            name: "Читинская медакадемия", 
            logo: chgma,
        },
        { 
            name: "Читаэнергосбыт", 
            logo: chitaenergo,
        },
        { 
            name: "ЭнергоЖилстрой", 
            logo: zilstroy,
        },
        { 
            name: "Micromine Russia", 
            logo: micromine,
        },
        { 
            name: "Сбербанк", 
            logo: sber,
        }
    ]

    const [duration, setDuration] = useState(30);

    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current) {
        // Динамическая скорость: чем больше контент, тем быстрее анимация
        const width = contentRef.current.offsetWidth;
        const calculatedDuration = width / 50; // 50px в секунду
        setDuration(calculatedDuration);
        }
    }, []);


    return (
        <div className="flex flex-col min-h-screen">
            <div className="">
                <div className="flex flex-col gap-10 mx-62.5">
                    <LandingPageFirstSection />
                </div>
                <div className="flex flex-col gap-10 mx-62.5 overflow-hidden">
                    <div className="text-5xl font-semibold">
                        С нами уже сотрудничают
                    </div>
                    
                    <div className="w-full overflow-hidden bg-gray-100 py-8">
                        <div className="relative flex">
                            <div 
                            className="flex animate-marquee whitespace-nowrap"
                            style={{ animationDuration: `${duration}s` }}
                            >
                            {[...Array(2)].map((_, setIndex) => (
                                <div key={setIndex} ref={setIndex === 0 ? contentRef : null} className="flex">
                                {companies.map((company, index) => (
                                    <div 
                                    key={`${setIndex}-${index}`}
                                    className="flex flex-col items-center gap-3 mx-8"
                                    >
                                        <img 
                                            src={company.logo} 
                                            alt={company.name}
                                            className="h-20 w-auto object-contain"
                                        />
                                        <span className="text-lg font-medium text-gray-800 whitespace-nowrap">
                                            {company.name}
                                        </span>
                                    </div>
                                ))}
                                </div>
                            ))}
                            </div>
                        </div>

                        <style jsx>{`
                            @keyframes marquee {
                            0% {
                                transform: translateX(0);
                            }
                            100% {
                                transform: translateX(-50%);
                            }
                            }
                            .animate-marquee {
                            animation: marquee linear infinite;
                            will-change: transform;
                            }
                        `}</style>
                    </div>
                </div>
                <div className="flex flex-col gap-10 pt-20 mx-62.5">
                    <div className="text-5xl font-semibold">
                        Как это работает?
                    </div>
                    <LandingPageSteps />
                </div>
                <div className="flex flex-col gap-10 pt-20 mx-62.5">
                    <div className="text-5xl font-semibold">
                        Почему выбирают Стадиум?
                    </div>
                    <LandingPageAdvantages />
                </div>
                <div className="pt-20 pb-20">
                    <LandingPageForm />
                </div>
            </div>
            {/* <div className="pt-20 mt-auto">
                <LandingPageFooter />
            </div> */}
        </div>
    )
}

export default LandingPage