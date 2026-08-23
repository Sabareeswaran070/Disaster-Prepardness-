import {
    BookOpen,
    Brain,
    ClipboardCheck,
    Home,
    LogOut,
    Megaphone,
    ShieldAlert,
    UserCircle,
    X,
    Menu,
} from "lucide-react";

import {
    NavLink,
    Outlet,
} from "react-router-dom";

import {
    useState,
} from "react";

import { useAuth } from "../context/AuthContext";

const StudentLayout = () => {
    const { user, logout } = useAuth();

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const navigation = [
        {
            name: "Dashboard",
            path: "/student/dashboard",
            icon: Home,
        },
        {
            name: "Lessons",
            path: "/student/lessons",
            icon: BookOpen,
        },
        {
            name: "Quizzes",
            path: "/student/quizzes",
            icon: ClipboardCheck,
        },
        {
            name: "Simulations",
            path: "/student/simulations",
            icon: Brain,
        },
        {
            name: "AI Tutor",
            path: "/student/ai-tutor",
            icon: Brain,
        },
        {
            name: "Emergency",
            path: "/student/emergency",
            icon: ShieldAlert,
        },
        {
            name: "Announcements",
            path: "/student/announcements",
            icon: Megaphone,
        },
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Mobile Header */}

            <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 lg:hidden">

                <button
                    onClick={() =>
                        setSidebarOpen(true)
                    }
                    className="rounded-lg p-2 hover:bg-slate-100"
                >
                    <Menu size={24} />
                </button>

                <h1 className="font-bold text-slate-900">
                    DisasterEdu
                </h1>

                <div className="w-10" />

            </header>


            {/* Mobile Overlay */}

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
          ${sidebarOpen
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
                            Student Portal
                        </p>
                    </div>

                    <button
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

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <UserCircle size={24} />
                        </div>

                        <div className="min-w-0">

                            <p className="truncate font-semibold text-slate-900">
                                {user?.full_name}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                                {user?.email}
                            </p>

                        </div>

                    </div>

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
                  ${isActive
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
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>

                </div>

            </aside>


            {/* Main Content */}

            <main className="min-h-screen lg:pl-64">

                <div className="pt-16 lg:pt-0">
                    <Outlet />
                </div>

            </main>

        </div>
    );
};

export default StudentLayout;