import {
    BookOpen,
    Brain,
    ClipboardCheck,
    Users,
} from "lucide-react";

import {
    useAuth,
} from "../../context/AuthContext";

import {
    useNavigate,
} from "react-router-dom";


const FacultyDashboard = () => {

    const {
        user,
    } = useAuth();

    const navigate = useNavigate();


    const cards = [
        {
            title: "Lessons",
            description: "Create and manage disaster education lessons.",
            icon: BookOpen,
            path: "/faculty/lessons",
        },
        {
            title: "Quizzes",
            description: "Create assessments and manage quiz questions.",
            icon: ClipboardCheck,
            path: "/faculty/quizzes",
        },
        {
            title: "Simulations",
            description: "Create and manage disaster simulations.",
            icon: Brain,
            path: "/faculty/simulations",
        },
        {
            title: "Students",
            description: "View students in your institution.",
            icon: Users,
            path: "/faculty/students",
        },
    ];


    return (
        <div className="p-6 lg:p-8">

            <div className="mb-8">

                <h1 className="text-3xl font-bold text-slate-900">
                    Faculty Dashboard
                </h1>

                <p className="mt-2 text-slate-500">
                    Welcome, {user?.full_name}.
                    Manage learning content and monitor your students.
                </p>

            </div>


            <div className="grid gap-6 md:grid-cols-2">

                {cards.map(
                    ({
                        title,
                        description,
                        icon: Icon,
                        path,
                    }) => (
                        <button
                            key={path}
                            type="button"
                            onClick={() =>
                                navigate(path)
                            }
                            className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                <Icon
                                    size={24}
                                    className="text-blue-600"
                                />
                            </div>

                            <h2 className="mt-5 text-xl font-bold text-slate-900">
                                {title}
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                {description}
                            </p>

                        </button>
                    )
                )}

            </div>

        </div>
    );
};


export default FacultyDashboard;