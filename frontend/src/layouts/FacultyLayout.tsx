import {
    BarChart3,
    Bell,
    BookOpen,
    Brain,
    ClipboardCheck,
    Home,
    LogOut,
    Menu,
    Megaphone,
    Users,
    X,
} from "lucide-react";

import {
    NavLink,
    Outlet,
} from "react-router-dom";

import {
    useState,
} from "react";

import { useAuth } from "../context/AuthContext";


const FacultyLayout = () => {

    const {
        user,
        logout,
    } = useAuth();

    const [
        sidebarOpen,
        setSidebarOpen,
    ] = useState(false);


    const navigation = [
        {
            name: "Dashboard",
            path: "/faculty/dashboard",
            icon: Home,
        },
        {
            name: "Lessons",
            path: "/faculty/lessons",
            icon: BookOpen,
        },
        {
            name: "Quizzes",
            path: "/faculty/quizzes",
            icon: ClipboardCheck,
        },
        {
            name: "Simulations",
            path: "/faculty/simulations",
            icon: Brain,
        },
        {
            name: "Announcements",
            path: "/faculty/announcements",
            icon: Megaphone,
        },
        {
            name: "Students",
            path: "/faculty/students",
            icon: Users,
        },
        {
            name: "Analytics",
            path: "/faculty/analytics",
            icon: BarChart3,
        },
    ];


    return (
        <div className="min-h-screen bg-slate-50">

            {/* Mobile Header */}

            <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 lg:hidden">

                <button
                    type="button"
                    onClick={() =>
                        setSidebarOpen(true)
                    }
                    className="rounded-lg p-2 hover:bg-slate-100"
                >
                    <Menu size={24} />
                </button>

                <h1 className="font-bold text-slate-900">
                    DisasterEdu Faculty
                </h1>

                <div className="w-10" />

            </header>


            {/* Overlay */}

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}


            {/* Sidebar */}

            <aside
                className={`
                    fixed left-0 top-0 z-50
                    flex h-screen w-64 flex-col
                    border-r bg-white
                    transition-transform duration-200
                    lg:translate-x-0
                    ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >

                {/* Logo */}

                <div className="flex h-16 items-center justify-between border-b px-5">

                    <div>
                        <h1 className="text-xl font-bold text-blue-600">
                            DisasterEdu
                        </h1>

                        <p className="text-xs text-slate-500">
                            Faculty Portal
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setSidebarOpen(false)
                        }
                        className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* User */}

                <div className="border-b px-5 py-5">

                    <p className="truncate font-semibold text-slate-900">
                        {user?.full_name}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                        {user?.email}
                    </p>

                    <p className="mt-1 text-xs font-semibold uppercase text-blue-600">
                        {user?.role}
                    </p>

                </div>


                {/* Navigation */}

                <nav className="flex-1 space-y-1 overflow-y-auto p-4">

                    {navigation.map(
                        ({
                            name,
                            path,
                            icon: Icon,
                        }) => (
                            <NavLink
                                key={path}
                                to={path}
                                onClick={() =>
                                    setSidebarOpen(false)
                                }
                                className={({ isActive }) =>
                                    `
                                    flex items-center gap-3
                                    rounded-lg px-4 py-3
                                    text-sm font-medium
                                    transition
                                    ${
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }
                                    `
                                }
                            >
                                <Icon size={20} />
                                <span>{name}</span>
                            </NavLink>
                        )
                    )}

                </nav>


                {/* Logout */}

                <div className="border-t p-4">

                    <button
                        type="button"
                        onClick={() =>
                            logout()
                        }
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>

                </div>

            </aside>


            {/* Main */}

            <main className="min-h-screen lg:pl-64">

                <div className="pt-16 lg:pt-0">
                    <Outlet />
                </div>

            </main>

        </div>
    );
};


export default FacultyLayout;