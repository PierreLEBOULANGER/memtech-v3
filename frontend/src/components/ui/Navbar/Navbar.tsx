import { Settings, LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Navbar = ({ onLogout, user }: { onLogout: () => void, user: any }) => {


    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const [minWidth, setMinWidth] = useState<number | undefined>(undefined);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    useEffect(() => {
        if (menuRef.current) {
            setMinWidth(menuRef.current.offsetWidth);
        }
    }, [menuRef.current, user?.first_name, user?.last_name]);


    return (
        <div className="w-full h-[70px] bg-black py-[20px] px-[20px] flex justify-between items-center">
            <img
                src="/assets/Ecriture - Courant (001).png"
                alt="TP Courant Logo"
                className="h-12 py-2"
            />
            <div
                className="flex items-center gap-4 text-white relative cursor-pointer hover:text-[#FFEC00]"
                ref={menuRef}
                onClick={() => setIsOpen(!isOpen)}
            >
                <User className="w-5 h-5" />
                <p className="text-base">{user?.first_name} {user?.last_name}</p>
            </div>

            {isOpen &&
                <div
                    className="z-30 bg-black px-[20px] pb-[20px] absolute top-[70px] right-0 flex flex-col gap-4"
                    style={{
                        minWidth: minWidth ? `${minWidth + 40}px` : undefined,
                        borderBottomLeftRadius: "10px",
                        borderBottomRightRadius: "10px"
                    }}
                >
                    <div className="flex items-center gap-4 cursor-pointer text-white hover:text-[#FFEC00]" onClick={() => console.log("COUCOU")}>
                        <Settings className="w-5 h-5" />
                        <p className="text-base">Paramètres</p>
                    </div>
                    <div className="flex items-center gap-4 cursor-pointer text-white hover:text-[#FFEC00]" onClick={onLogout}>
                        <LogOut className="w-5 h-5" />
                        <p className="text-base">Déconnexion</p>
                    </div>
                </div>
            }
        </div>
    )
}

export default Navbar