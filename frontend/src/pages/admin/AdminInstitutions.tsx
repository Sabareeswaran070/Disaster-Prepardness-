import {
    Building2,
    CheckCircle,
    Edit,
    MapPin,
    Plus,
    Power,
    Search,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    createInstitution,
    deactivateInstitution,
    getInstitutions,
    updateInstitution,
    type InstitutionCreate,
} from "../../api/institutions";

import type {
    Institution,
} from "../../types/institution";


interface InstitutionForm {
    name: string;
    institution_type: string;
    address: string;
    city: string;
    state: string;
    contact_email: string;
    contact_phone: string;
}


const emptyForm: InstitutionForm = {
    name: "",
    institution_type: "",
    address: "",
    city: "",
    state: "",
    contact_email: "",
    contact_phone: "",
};


const AdminInstitutions = () => {

    const [institutions, setInstitutions] =
        useState<Institution[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [search, setSearch] =
        useState("");

    const [showModal, setShowModal] =
        useState(false);

    const [editingInstitution, setEditingInstitution] =
        useState<Institution | null>(null);

    const [form, setForm] =
        useState<InstitutionForm>(emptyForm);

    const [saving, setSaving] =
        useState(false);


    const loadInstitutions = async () => {

        try {

            setLoading(true);
            setError(null);

            const data =
                await getInstitutions();

            setInstitutions(data);

        } catch (err) {

            console.error(
                "Failed to load institutions:",
                err
            );

            setError(
                "Failed to load institutions."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadInstitutions();

    }, []);


    const openCreate = () => {

        setEditingInstitution(null);
        setForm(emptyForm);
        setError(null);
        setShowModal(true);

    };


    const openEdit = (
        institution: Institution
    ) => {

        setEditingInstitution(institution);

        setForm({
            name: institution.name,
            institution_type:
                institution.institution_type,
            address:
                institution.address ?? "",
            city:
                institution.city ?? "",
            state:
                institution.state ?? "",
            contact_email:
                institution.contact_email ?? "",
            contact_phone:
                institution.contact_phone ?? "",
        });

        setError(null);
        setShowModal(true);

    };


    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingInstitution(null);
        setForm(emptyForm);

    };


    const handleChange = (
        field: keyof InstitutionForm,
        value: string
    ) => {

        setForm(previous => ({
            ...previous,
            [field]: value,
        }));

    };


    const handleSubmit = async (
        event: React.FormEvent
    ) => {

        event.preventDefault();

        if (!form.name.trim()) {
            setError(
                "Institution name is required."
            );
            return;
        }

        if (!form.institution_type.trim()) {
            setError(
                "Institution type is required."
            );
            return;
        }


        try {

            setSaving(true);
            setError(null);


            const data: InstitutionCreate = {
                name: form.name.trim(),
                institution_type:
                    form.institution_type.trim(),
                address:
                    form.address.trim() || null,
                city:
                    form.city.trim() || null,
                state:
                    form.state.trim() || null,
                contact_email:
                    form.contact_email.trim() || null,
                contact_phone:
                    form.contact_phone.trim() || null,
            };


            if (editingInstitution) {

                await updateInstitution(
                    editingInstitution.id,
                    data
                );

            } else {

                await createInstitution(data);

            }


            await loadInstitutions();

            setShowModal(false);
            setEditingInstitution(null);
            setForm(emptyForm);

        } catch (err) {

            console.error(
                "Failed to save institution:",
                err
            );

            setError(
                "Failed to save institution."
            );

        } finally {

            setSaving(false);

        }
    };


    const toggleStatus = async (
        institution: Institution
    ) => {

        const action =
            institution.is_active
                ? "deactivate"
                : "activate";


        const confirmed = window.confirm(
            `Are you sure you want to ${action} "${institution.name}"?`
        );

        if (!confirmed) {
            return;
        }


        try {

            setError(null);


            if (institution.is_active) {

                await deactivateInstitution(
                    institution.id
                );

            } else {

                await updateInstitution(
                    institution.id,
                    {
                        is_active: true,
                    }
                );

            }


            await loadInstitutions();

        } catch (err) {

            console.error(
                "Failed to update institution status:",
                err
            );

            setError(
                `Failed to ${action} institution.`
            );

        }
    };


    const filteredInstitutions =
        institutions.filter(
            institution => {

                const query =
                    search
                        .trim()
                        .toLowerCase();

                if (!query) {
                    return true;
                }

                return (
                    institution.name
                        .toLowerCase()
                        .includes(query) ||

                    institution.institution_type
                        .toLowerCase()
                        .includes(query) ||

                    institution.city
                        ?.toLowerCase()
                        .includes(query) ||

                    institution.state
                        ?.toLowerCase()
                        .includes(query) ||

                    institution.contact_email
                        ?.toLowerCase()
                        .includes(query)
                );

            }
        );


    return (
        <div className="p-6 lg:p-8">

            {/* Page Header */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50">

                        <Building2
                            size={28}
                            className="text-blue-600"
                        />

                    </div>

                    <div>

                        <h1 className="text-3xl font-bold text-slate-900">
                            Institutions
                        </h1>

                        <p className="mt-1 text-slate-500">
                            Manage institutions and their contact information.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    onClick={openCreate}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >

                    <Plus size={19} />

                    Add Institution

                </button>

            </div>


            {/* Search */}

            <div className="mb-6 rounded-xl border border-slate-300 bg-white p-4 shadow-sm">

                <div className="relative">

                    <Search
                        size={20}
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
                        placeholder="Search institution..."
                        className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                </div>

            </div>


            {/* Error */}

            {error && !showModal && (

                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>

            )}


            {/* Content */}

            <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">

                {loading ? (

                    <div className="px-6 py-12 text-center text-slate-500">
                        Loading institutions...
                    </div>

                ) : filteredInstitutions.length === 0 ? (

                    <div className="px-6 py-12 text-center">

                        <Building2
                            size={40}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 font-semibold text-slate-700">
                            No institutions found
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            {search
                                ? "Try a different search."
                                : "Add your first institution."}
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[950px]">

                            <thead>

                                <tr className="border-b border-slate-300 bg-slate-50 text-left">

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Institution
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Type
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Location
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Contact
                                    </th>

                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredInstitutions.map(
                                    institution => (

                                        <tr
                                            key={institution.id}
                                            className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50"
                                        >

                                            {/* Institution */}

                                            <td className="px-6 py-5">

                                                <p className="font-semibold text-slate-900">
                                                    {institution.name}
                                                </p>

                                                {institution.address && (

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {institution.address}
                                                    </p>

                                                )}

                                            </td>


                                            {/* Type */}

                                            <td className="px-6 py-5">

                                                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">

                                                    {institution.institution_type}

                                                </span>

                                            </td>


                                            {/* Location */}

                                            <td className="px-6 py-5">

                                                <div className="flex items-start gap-2 text-sm text-slate-600">

                                                    <MapPin
                                                        size={17}
                                                        className="mt-0.5 shrink-0 text-slate-400"
                                                    />

                                                    <span>

                                                        {[
                                                            institution.city,
                                                            institution.state,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(", ") || "—"}

                                                    </span>

                                                </div>

                                            </td>


                                            {/* Contact */}

                                            <td className="px-6 py-5">

                                                <div className="text-sm">

                                                    <p className="text-slate-700">
                                                        {institution.contact_email || "—"}
                                                    </p>

                                                    {institution.contact_phone && (

                                                        <p className="mt-1 text-slate-500">
                                                            {institution.contact_phone}
                                                        </p>

                                                    )}

                                                </div>

                                            </td>


                                            {/* Status */}

                                            <td className="px-6 py-5">

                                                {institution.is_active ? (

                                                    <div className="flex items-center gap-2 font-medium text-green-600">

                                                        <CheckCircle
                                                            size={18}
                                                        />

                                                        Active

                                                    </div>

                                                ) : (

                                                    <div className="flex items-center gap-2 font-medium text-slate-400">

                                                        <Power
                                                            size={18}
                                                        />

                                                        Inactive

                                                    </div>

                                                )}

                                            </td>


                                            {/* Actions */}

                                            <td className="px-6 py-5">

                                                <div className="flex items-center justify-end gap-4">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEdit(
                                                                institution
                                                            )
                                                        }
                                                        className="flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800"
                                                    >

                                                        <Edit
                                                            size={17}
                                                        />

                                                        Edit

                                                    </button>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleStatus(
                                                                institution
                                                            )
                                                        }
                                                        className={
                                                            institution.is_active
                                                                ? "flex items-center gap-1.5 font-medium text-red-600 hover:text-red-800"
                                                                : "flex items-center gap-1.5 font-medium text-green-600 hover:text-green-800"
                                                        }
                                                    >

                                                        <Power
                                                            size={17}
                                                        />

                                                        {institution.is_active
                                                            ? "Deactivate"
                                                            : "Activate"}

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* Count */}

            {!loading && (

                <p className="mt-4 text-sm text-slate-500">

                    Showing{" "}
                    {filteredInstitutions.length}{" "}
                    of{" "}
                    {institutions.length}{" "}
                    institutions

                </p>

            )}


            {/* Create / Edit Modal */}

            {showModal && (

                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">

                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        {/* Modal Header */}

                        <div className="flex items-center justify-between border-b border-slate-300 px-6 py-5">

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">

                                    {editingInstitution
                                        ? "Edit Institution"
                                        : "Create Institution"}

                                </h2>

                                <p className="mt-1 text-sm text-slate-500">

                                    {editingInstitution
                                        ? "Update institution information."
                                        : "Add a new institution to DisasterEdu."}

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                            >

                                <X size={22} />

                            </button>

                        </div>


                        {/* Modal Body */}

                        <form onSubmit={handleSubmit}>

                            <div className="space-y-5 px-6 py-6">

                                {error && (

                                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                        {error}
                                    </div>

                                )}


                                {/* Name */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Institution Name
                                    </label>

                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={event =>
                                            handleChange(
                                                "name",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter institution name"
                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        required
                                    />

                                </div>


                                {/* Type */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Institution Type
                                    </label>

                                    <input
                                        type="text"
                                        value={form.institution_type}
                                        onChange={event =>
                                            handleChange(
                                                "institution_type",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Example: College, School, University"
                                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        required
                                    />

                                </div>


                                {/* Address */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Address
                                    </label>

                                    <textarea
                                        value={form.address}
                                        onChange={event =>
                                            handleChange(
                                                "address",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter institution address"
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* City / State */}

                                <div className="grid gap-5 sm:grid-cols-2">

                                    <div>

                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            City
                                        </label>

                                        <input
                                            type="text"
                                            value={form.city}
                                            onChange={event =>
                                                handleChange(
                                                    "city",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter city"
                                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>


                                    <div>

                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            State
                                        </label>

                                        <input
                                            type="text"
                                            value={form.state}
                                            onChange={event =>
                                                handleChange(
                                                    "state",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter state"
                                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>


                                {/* Email / Phone */}

                                <div className="grid gap-5 sm:grid-cols-2">

                                    <div>

                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Contact Email
                                        </label>

                                        <input
                                            type="email"
                                            value={form.contact_email}
                                            onChange={event =>
                                                handleChange(
                                                    "contact_email",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="institution@example.com"
                                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>


                                    <div>

                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Contact Phone
                                        </label>

                                        <input
                                            type="tel"
                                            value={form.contact_phone}
                                            onChange={event =>
                                                handleChange(
                                                    "contact_phone",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter phone number"
                                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* Modal Footer */}

                            <div className="flex justify-end gap-3 border-t border-slate-300 px-6 py-5">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {saving
                                        ? "Saving..."
                                        : editingInstitution
                                            ? "Save Changes"
                                            : "Create"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};


export default AdminInstitutions;