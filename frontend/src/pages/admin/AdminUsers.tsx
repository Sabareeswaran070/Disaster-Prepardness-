import {

    Plus,
    Search,
    Shield,
    UserCheck,
    UserX,
    X,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    createFaculty,
    createInstitutionAdmin,
    getUsers,
    updateUserRole,
    updateUserStatus,
} from "../../api/users";

import {
    getInstitutions,
} from "../../api/institutions";

import type {
    User,
    CreateManagedUserRequest,
} from "../../types/user";

import type {
    Institution,
} from "../../types/institution";

import {
    useAuth,
} from "../../context/AuthContext";


interface UserForm {
    full_name: string;
    email: string;
    password: string;
    institution_id: string;
}


const emptyForm: UserForm = {
    full_name: "",
    email: "",
    password: "",
    institution_id: "",
};


const AdminUsers = () => {

    const {
        user: currentUser,
    } = useAuth();


    const [users, setUsers] =
        useState<User[]>([]);

    const [institutions, setInstitutions] =
        useState<Institution[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [search, setSearch] =
        useState("");

    const [roleFilter, setRoleFilter] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("");

    const [showModal, setShowModal] =
        useState(false);

    const [createRole, setCreateRole] =
        useState<"FACULTY" | "INSTITUTION_ADMIN">(
            "FACULTY"
        );

    const [form, setForm] =
        useState<UserForm>(emptyForm);


    const isAdmin =
        currentUser?.role === "ADMIN";


    const loadData = async () => {

        try {

            setLoading(true);
            setError(null);

            const userData =
                await getUsers();

            setUsers(userData);

            if (isAdmin) {

                const institutionData =
                    await getInstitutions();

                setInstitutions(
                    institutionData
                );

            }

        } catch (err) {

            console.error(
                "Failed to load users:",
                err
            );

            setError(
                "Failed to load users."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadData();

    }, [isAdmin]);


    const institutionMap =
        useMemo(() => {

            const map =
                new Map<number, string>();

            institutions.forEach(
                institution => {
                    map.set(
                        institution.id,
                        institution.name
                    );
                }
            );

            return map;

        }, [institutions]);


    const filteredUsers =
        useMemo(() => {

            const searchValue =
                search.trim().toLowerCase();

            return users.filter(user => {

                const matchesSearch =
                    !searchValue ||
                    user.full_name
                        .toLowerCase()
                        .includes(searchValue) ||
                    user.email
                        .toLowerCase()
                        .includes(searchValue);

                const matchesRole =
                    !roleFilter ||
                    user.role === roleFilter;

                const matchesStatus =
                    !statusFilter ||
                    (
                        statusFilter === "ACTIVE"
                            ? user.is_active
                            : !user.is_active
                    );

                return (
                    matchesSearch &&
                    matchesRole &&
                    matchesStatus
                );

            });

        }, [
            users,
            search,
            roleFilter,
            statusFilter,
        ]);


    const openCreate =
        (
            role:
                "FACULTY" |
                "INSTITUTION_ADMIN"
        ) => {

            setCreateRole(role);
            setForm(emptyForm);
            setError(null);
            setShowModal(true);

        };


    const closeModal =
        () => {

            if (saving) {
                return;
            }

            setShowModal(false);
            setForm(emptyForm);

        };


    const handleSubmit =
        async (
            event: React.FormEvent
        ) => {

            event.preventDefault();

            if (
                !form.full_name.trim() ||
                !form.email.trim() ||
                !form.password
            ) {
                setError(
                    "Please fill all required fields."
                );
                return;
            }

            if (
                form.password.length < 8
            ) {
                setError(
                    "Password must contain at least 8 characters."
                );
                return;
            }

            if (
                createRole === "FACULTY" &&
                isAdmin &&
                !form.institution_id
            ) {
                setError(
                    "Please select an institution."
                );
                return;
            }

            try {

                setSaving(true);
                setError(null);

                const data:
                    CreateManagedUserRequest = {
                    full_name:
                        form.full_name.trim(),
                    email:
                        form.email.trim(),
                    password:
                        form.password,
                    institution_id:
                        form.institution_id
                            ? Number(
                                form.institution_id
                            )
                            : null,
                };


                if (
                    createRole ===
                    "INSTITUTION_ADMIN"
                ) {

                    await createInstitutionAdmin(
                        data
                    );

                } else {

                    await createFaculty(
                        data
                    );

                }


                await loadData();

                closeModal();

            } catch (err: any) {

                console.error(
                    "Failed to create user:",
                    err
                );

                setError(
                    err?.response?.data?.detail ??
                    "Failed to create user."
                );

            } finally {

                setSaving(false);

            }

        };


    const handleRoleChange =
        async (
            targetUser: User,
            newRole: string
        ) => {

            if (!isAdmin) {
                return;
            }

            if (
                targetUser.id ===
                currentUser?.id
            ) {
                return;
            }

            try {

                setError(null);

                await updateUserRole(
                    targetUser.id,
                    {
                        role: newRole,
                    }
                );

                await loadData();

            } catch (err: any) {

                console.error(
                    "Failed to update role:",
                    err
                );

                setError(
                    err?.response?.data?.detail ??
                    "Failed to update user role."
                );

            }

        };


    const handleStatusChange =
        async (
            targetUser: User
        ) => {

            if (
                targetUser.id ===
                currentUser?.id
            ) {
                return;
            }

            try {

                setError(null);

                await updateUserStatus(
                    targetUser.id,
                    {
                        is_active:
                            !targetUser.is_active,
                    }
                );

                await loadData();

            } catch (err: any) {

                console.error(
                    "Failed to update status:",
                    err
                );

                setError(
                    err?.response?.data?.detail ??
                    "Failed to update user status."
                );

            }

        };


    return (
        <div className="p-6 lg:p-8">

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Users
                    </h1>

                    <p className="mt-1 text-slate-500">
                        Manage users, roles and account status.
                    </p>
                </div>


                <div className="flex flex-wrap gap-2">

                    <button
                        type="button"
                        onClick={() =>
                            openCreate("FACULTY")
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Add Faculty
                    </button>


                    {isAdmin && (
                        <button
                            type="button"
                            onClick={() =>
                                openCreate(
                                    "INSTITUTION_ADMIN"
                                )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            <Shield size={18} />
                            Add Institution Admin
                        </button>
                    )}

                </div>

            </div>


            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}


            <div className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3">

                <div className="relative">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={event =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search name or email..."
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                    />

                </div>


                <select
                    value={roleFilter}
                    onChange={event =>
                        setRoleFilter(
                            event.target.value
                        )
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                    <option value="">
                        All Roles
                    </option>

                    <option value="STUDENT">
                        Student
                    </option>

                    <option value="FACULTY">
                        Faculty
                    </option>

                    <option value="INSTITUTION_ADMIN">
                        Institution Admin
                    </option>

                    <option value="ADMIN">
                        Admin
                    </option>

                </select>


                <select
                    value={statusFilter}
                    onChange={event =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                    <option value="">
                        All Status
                    </option>

                    <option value="ACTIVE">
                        Active
                    </option>

                    <option value="INACTIVE">
                        Inactive
                    </option>

                </select>

            </div>


            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                {loading ? (

                    <div className="p-10 text-center text-slate-500">
                        Loading users...
                    </div>

                ) : filteredUsers.length === 0 ? (

                    <div className="p-10 text-center text-slate-500">
                        No users found.
                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[900px]">

                            <thead className="border-b bg-slate-50">

                                <tr>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        User
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Role
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Institution
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y">

                                {filteredUsers.map(
                                    targetUser => {

                                        const isSelf =
                                            targetUser.id ===
                                            currentUser?.id;

                                        return (
                                            <tr
                                                key={
                                                    targetUser.id
                                                }
                                                className="hover:bg-slate-50"
                                            >

                                                <td className="px-5 py-4">

                                                    <div className="font-semibold text-slate-900">
                                                        {
                                                            targetUser.full_name
                                                        }
                                                    </div>

                                                    <div className="text-sm text-slate-500">
                                                        {
                                                            targetUser.email
                                                        }
                                                    </div>

                                                </td>


                                                <td className="px-5 py-4">

                                                    {isAdmin &&
                                                        !isSelf ? (

                                                        <select
                                                            value={
                                                                targetUser.role
                                                            }
                                                            onChange={
                                                                event =>
                                                                    handleRoleChange(
                                                                        targetUser,
                                                                        event.target.value
                                                                    )
                                                            }
                                                            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                                                        >

                                                            <option value="STUDENT">
                                                                Student
                                                            </option>

                                                            <option value="FACULTY">
                                                                Faculty
                                                            </option>

                                                            <option value="INSTITUTION_ADMIN">
                                                                Institution Admin
                                                            </option>

                                                            <option value="ADMIN">
                                                                Admin
                                                            </option>

                                                        </select>

                                                    ) : (

                                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                            {
                                                                targetUser.role
                                                            }
                                                        </span>

                                                    )}

                                                </td>


                                                <td className="px-5 py-4 text-sm text-slate-600">

                                                    {targetUser.institution_id
                                                        ? (
                                                            institutionMap.get(
                                                                targetUser.institution_id
                                                            ) ??
                                                            `Institution #${targetUser.institution_id}`
                                                        )
                                                        : "�"}

                                                </td>


                                                <td className="px-5 py-4">

                                                    <span
                                                        className={
                                                            `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${targetUser.is_active
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                            }`
                                                        }
                                                    >
                                                        {
                                                            targetUser.is_active
                                                                ? "Active"
                                                                : "Inactive"
                                                        }
                                                    </span>

                                                </td>


                                                <td className="px-5 py-4 text-right">

                                                    {!isSelf && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    targetUser
                                                                )
                                                            }
                                                            className={
                                                                `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${targetUser.is_active
                                                                    ? "text-red-600 hover:bg-red-50"
                                                                    : "text-green-600 hover:bg-green-50"
                                                                }`
                                                            }
                                                        >

                                                            {targetUser.is_active ? (
                                                                <>
                                                                    <UserX
                                                                        size={16}
                                                                    />
                                                                    Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheck
                                                                        size={16}
                                                                    />
                                                                    Activate
                                                                </>
                                                            )}

                                                        </button>
                                                    )}

                                                    {isSelf && (
                                                        <span className="text-xs text-slate-400">
                                                            Current user
                                                        </span>
                                                    )}

                                                </td>

                                            </tr>
                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {showModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b px-6 py-4">

                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {createRole ===
                                        "FACULTY"
                                        ? "Add Faculty"
                                        : "Add Institution Admin"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Create a new managed user account.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="space-y-4 p-6"
                        >

                            <div>

                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        form.full_name
                                    }
                                    onChange={
                                        event =>
                                            setForm(
                                                previous => ({
                                                    ...previous,
                                                    full_name:
                                                        event.target.value,
                                                })
                                            )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                    required
                                />

                            </div>


                            <div>

                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={
                                        form.email
                                    }
                                    onChange={
                                        event =>
                                            setForm(
                                                previous => ({
                                                    ...previous,
                                                    email:
                                                        event.target.value,
                                                })
                                            )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                    required
                                />

                            </div>


                            <div>

                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    value={
                                        form.password
                                    }
                                    onChange={
                                        event =>
                                            setForm(
                                                previous => ({
                                                    ...previous,
                                                    password:
                                                        event.target.value,
                                                })
                                            )
                                    }
                                    minLength={8}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                    required
                                />

                            </div>


                            {isAdmin && (

                                <div>

                                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                                        Institution
                                    </label>

                                    <select
                                        value={
                                            form.institution_id
                                        }
                                        onChange={
                                            event =>
                                                setForm(
                                                    previous => ({
                                                        ...previous,
                                                        institution_id:
                                                            event.target.value,
                                                    })
                                                )
                                        }
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                        required
                                    >

                                        <option value="">
                                            Select institution
                                        </option>

                                        {institutions
                                            .filter(
                                                institution =>
                                                    institution.is_active
                                            )
                                            .map(
                                                institution => (
                                                    <option
                                                        key={
                                                            institution.id
                                                        }
                                                        value={
                                                            institution.id
                                                        }
                                                    >
                                                        {
                                                            institution.name
                                                        }
                                                    </option>
                                                )
                                            )}

                                    </select>

                                </div>

                            )}


                            <div className="flex justify-end gap-3 border-t pt-4">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create User"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};


export default AdminUsers;
