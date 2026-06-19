import { useLocation } from "react-router-dom"

function Footer () {
    const location = useLocation()

    return (
        <footer className={`w-full mt-auto text-center pb-3.75 pt-2 ${location.pathname === '/' ? 'hidden' : 'block'}`}>
            2026
        </footer>
    )
}

export default Footer