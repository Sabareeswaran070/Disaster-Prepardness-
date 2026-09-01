import {
    Search,
    Users,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getUsers,
} from "../../api/users";

import type {
    User,
} from "../../types/user";


const FacultyStudents = () => {

    const [
        users,
        setUsers,
    ] = useState<User[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const [
        search,
        setSearch,
    ] = useState("");


    useEffect(() => {

        const loadStudents = async () => {

            try {

                setLoading(true);
                setError("");

                const data =
                    await getUsers();

                setUsers(
                    data.filter(
                        (user) =>
                            user.role === "STUDENT"
                    )
                );

            } catch (err) {

                console.error(
                    "Failed to load students:",
                    err
                );

                setError(
                    "Failed to load students."
                );

            } finally {

                setLoading(false);

            }
        };


        loadStudents();

    }, []);


    const filteredStudents =
        useMemo(() => {

            const value =
                search
                    .trim()
                    .toLowerCase();

            if (!value) {
                return users;
            }

            return users.filter(
                (student) =>
                    student.full_name
                        .toLowerCase()
                        .includes(value)
                    ||
                    student.email
                        .toLowerCase()
                        .includes(value)
            );

        }, [
            users,
            search,
        ]);


    return (
        <div className="p-6 lg:p-8">

            {/* Header */}

            <div className="mb-8">

                <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-blue-50 p-3">

                        <Users
                            size={26}
                            className="text-blue-600"
                        />

                    </div>

                    <div>

                        <h1 className="text-3xl font-bold text-slate-900">
                            Students
                        </h1>

                        <p className="mt-1 text-slate-500">
                            View students in your institution.
                        </p>

                    </div>

                </div>

            </div>


            {/* Search */}

            <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">

                <div className="relative">

                    <Search
                        size={20}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search student name or email..."
                        className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                </div>

            </div>


            {/* Error */}

            {error && (

                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>

            )}


            {/* Loading */}

            {loading ? (

                <div className="rounded-xl border bg-white p-8 text-center text-slate-500">
                    Loading students...
                </div>

            ) : (

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead className="border-b bg-slate-50">

                                <tr className="text-sm text-slate-500">

                                    <th className="px-6 py-4">
                                        Student
                                    </th>

                                    <th className="px-6 py-4">
                                        Email
                                    </th>

                                    <th className="px-6 py-4">
                                        Status
                                    </th>

                                    <th className="px-6 py-4">
                                        Joined
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredStudents.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan={4}
                                            className="px-6 py-12 text-center text-slate-500"
                                        >
                                            No students found.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredStudents.map(
                                        (student) => (

                                            <tr
                                                key={student.id}
                                                className="border-b last:border-0 hover:bg-slate-50"
                                            >

                                                <td className="px-6 py-4">

                                                    <p className="font-medium text-slate-900">
                                                        {student.full_name}
                                                    </p>

                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {student.email}
                                                </td>

                                                <td className="px-6 py-4">

                                                    <span
                                                        className={
                                                            student.is_active
                                                                ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                                                                : "rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                                                        }
                                                    >
                                                        {student.is_active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>

                                                </td>

                                                <td className="px-6 py-4 text-sm text-slate-500">

                                                    {new Date(
                                                        student.created_at
                                                    ).toLocaleDateString()}

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                    <div className="border-t px-6 py-4 text-sm text-slate-500">

                        Showing {filteredStudents.length} of{" "}
                        {users.length} students

                    </div>

                </div>

            )}

        </div>
    );
};


export default FacultyStudents;