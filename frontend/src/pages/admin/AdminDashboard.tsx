import {
    Bell,
    BookOpen,
    ClipboardCheck,
    Megaphone,
    ShieldAlert,
    Users,
} from "lucide-react";

import {
    Link,
} from "react-router-dom";


const AdminDashboard = () => {

    const cards = [
        {
            title: "Disasters",
            description: "Manage disaster types and safety guidelines.",
            path: "/admin/disasters",
            icon: ShieldAlert,
        },
        {
            title: "Lessons",
            description: "Create and manage educational lessons.",
            path: "/admin/lessons",
            icon: BookOpen,
        },
        {
            title: "Quizzes",
            description: "Manage quizzes and assessments.",
            path: "/admin/quizzes",
            icon: ClipboardCheck,
        },
        {
            title: "Announcements",
            description: "Publish important notices to students.",
            path: "/admin/announcements",
            icon: Megaphone,
        },
        {
            title: "Emergency Resources",
            description: "Manage emergency contact information.",
            path: "/admin/emergencies",
            icon: Bell,
        },
        {
            title: "Users",
            description: "Manage users and roles.",
            path: "/admin/users",
            icon: Users,
        },
    ];


    return (
        <div className="p-6 lg:p-8">

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Admin Dashboard
                </h1>

                <p className="mt-2 text-slate-500">
                    Manage DisasterEdu content, users, and resources.
                </p>
            </div>


            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

                {cards.map(
                    ({
                        title,
                        description,
                        path,
                        icon: Icon,
                    }) => (
                        <Link
                            key={path}
                            to={path}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >

                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Icon size={24} />
                            </div>

                            <h2 className="text-lg font-bold text-slate-900">
                                {title}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {description}
                            </p>

                        </Link>
                    )
                )}

            </div>

        </div>
    );
};


export default AdminDashboard;