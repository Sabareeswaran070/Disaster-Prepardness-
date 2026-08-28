import {
    AlertTriangle,
    Edit,
    Phone,
    Plus,
    ShieldAlert,
    Trash2,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";
import {
    type FormEvent,
} from "react";
import {
    createEmergency,
    deleteEmergency,
    getEmergencies,
    updateEmergency,
} from "../../api/emergency";

import {
    getDisasters,
} from "../../api/disasters";

import type {
    Emergency,
} from "../../types/emergency";

import type {
    Disaster,
} from "../../types/disaster";


interface EmergencyForm {
    disaster_id: number | null;
    name: string;
    category: string;
    phone: string;
    description: string;
    is_active: boolean;
}


const emptyForm: EmergencyForm = {
    disaster_id: null,
    name: "",
    category: "",
    phone: "",
    description: "",
    is_active: true,
};


const AdminEmergencies = () => {

    const [
        disasters,
        setDisasters,
    ] = useState<Disaster[]>([]);

    const [
        emergencies,
        setEmergencies,
    ] = useState<Emergency[]>([]);

    const [
        selectedDisasterId,
        setSelectedDisasterId,
    ] = useState<number | "all">("all");

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    const [
        showForm,
        setShowForm,
    ] = useState(false);

    const [
        editingId,
        setEditingId,
    ] = useState<number | null>(null);

    const [
        form,
        setForm,
    ] = useState<EmergencyForm>(emptyForm);

    const [
        saving,
        setSaving,
    ] = useState(false);


    /*
     * =========================
     * Load disasters
     * =========================
     */

    useEffect(() => {

        const loadDisasters =
            async () => {

                try {

                    const data =
                        await getDisasters();

                    setDisasters(data);

                } catch (err) {

                    console.error(
                        "Failed to load disasters:",
                        err
                    );

                    setError(
                        "Unable to load disasters."
                    );
                }
            };

        loadDisasters();

    }, []);


    /*
     * =========================
     * Load emergencies
     * =========================
     */

    const loadEmergencies =
        async () => {

            try {

                setLoading(true);
                setError(null);

                const data =
                    await getEmergencies(
                        selectedDisasterId === "all"
                            ? undefined
                            : selectedDisasterId
                    );

                setEmergencies(data);

            } catch (err) {

                console.error(
                    "Failed to load emergency resources:",
                    err
                );

                setEmergencies([]);

                setError(
                    "Unable to load emergency resources."
                );

            } finally {

                setLoading(false);
            }
        };


    useEffect(() => {

        loadEmergencies();

    }, [selectedDisasterId]);


    /*
     * =========================
     * Open create form
     * =========================
     */

    const openCreateForm = () => {

        setEditingId(null);

        setForm({
            ...emptyForm,
            disaster_id:
                selectedDisasterId === "all"
                    ? null
                    : selectedDisasterId,
        });

        setShowForm(true);
    };


    /*
     * =========================
     * Open edit form
     * =========================
     */

    const openEditForm =
        (resource: Emergency) => {

            setEditingId(resource.id);

            setForm({
                disaster_id:
                    resource.disaster_id,
                name:
                    resource.name,
                category:
                    resource.category,
                phone:
                    resource.phone ?? "",
                description:
                    resource.description ?? "",
                is_active:
                    resource.is_active,
            });

            setShowForm(true);
        };


    /*
     * =========================
     * Close form
     * =========================
     */

    const closeForm = () => {

        if (saving) {
            return;
        }

        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
    };


    /*
     * =========================
     * Submit
     * =========================
     */

    const handleSubmit =
        async (
            event: FormEvent<HTMLFormElement>
        ) => {

            event.preventDefault();

            if (!form.name.trim()) {

                setError(
                    "Emergency resource name is required."
                );

                return;
            }

            if (!form.category.trim()) {

                setError(
                    "Category is required."
                );

                return;
            }

            try {

                setSaving(true);
                setError(null);

                if (editingId !== null) {

                    await updateEmergency(
                        editingId,
                        {
                            disaster_id:
                                form.disaster_id,
                            name:
                                form.name.trim(),
                            category:
                                form.category.trim(),
                            phone:
                                form.phone.trim()
                                || null,
                            description:
                                form.description.trim()
                                || null,
                            is_active:
                                form.is_active,
                        }
                    );

                } else {

                    await createEmergency({
                        disaster_id:
                            form.disaster_id,
                        name:
                            form.name.trim(),
                        category:
                            form.category.trim(),
                        phone:
                            form.phone.trim()
                            || null,
                        description:
                            form.description.trim()
                            || null,
                    });
                }

                closeForm();

                await loadEmergencies();

            } catch (err) {

                console.error(
                    "Failed to save emergency resource:",
                    err
                );

                setError(
                    "Unable to save emergency resource."
                );

            } finally {

                setSaving(false);
            }
        };


    /*
     * =========================
     * Delete
     * =========================
     */

    const handleDelete =
        async (
            resource: Emergency
        ) => {

            const confirmed =
                window.confirm(
                    `Delete "${resource.name}"? This action cannot be undone.`
                );

            if (!confirmed) {
                return;
            }

            try {

                setError(null);

                await deleteEmergency(
                    resource.id
                );

                await loadEmergencies();

            } catch (err) {

                console.error(
                    "Failed to delete emergency resource:",
                    err
                );

                setError(
                    "Unable to delete emergency resource."
                );
            }
        };


    /*
     * =========================
     * Disaster name
     * =========================
     */

    const getDisasterName =
        (disasterId: number | null) => {

            if (disasterId === null) {
                return "All disasters";
            }

            return (
                disasters.find(
                    (disaster) =>
                        disaster.id === disasterId
                )?.name
                ?? "Unknown disaster"
            );
        };


    return (
        <div className="p-6 lg:p-8">

            {/* Header */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-start gap-4">

                    <div className="rounded-2xl bg-red-100 p-4">

                        <ShieldAlert
                            size={32}
                            className="text-red-600"
                        />

                    </div>

                    <div>

                        <h1 className="text-3xl font-bold text-slate-900">
                            Emergency Resources
                        </h1>

                        <p className="mt-1 text-slate-500">
                            Manage emergency contacts and disaster-specific resources.
                        </p>

                    </div>

                </div>


                <button
                    type="button"
                    onClick={openCreateForm}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >

                    <Plus size={18} />

                    Add Resource

                </button>

            </div>


            {/* Error */}

            {error && (

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                    <AlertTriangle
                        size={20}
                        className="mt-0.5 shrink-0 text-red-600"
                    />

                    <p className="text-sm font-medium text-red-700">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        <X size={18} />
                    </button>

                </div>

            )}


            {/* Disaster filter */}

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <label
                    htmlFor="admin-disaster-select"
                    className="block text-sm font-semibold text-slate-700"
                >
                    Filter by Disaster
                </label>

                <select
                    id="admin-disaster-select"
                    value={selectedDisasterId}
                    onChange={(event) => {

                        const value =
                            event.target.value;

                        setSelectedDisasterId(
                            value === "all"
                                ? "all"
                                : Number(value)
                        );

                    }}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >

                    <option value="all">
                        All disasters
                    </option>

                    {disasters.map(
                        (disaster) => (

                            <option
                                key={disaster.id}
                                value={disaster.id}
                            >
                                {disaster.name}
                            </option>

                        )
                    )}

                </select>

            </div>


            {/* Loading */}

            {loading && (

                <div className="mt-8 grid gap-5 md:grid-cols-2">

                    {[1, 2, 3, 4].map(
                        (item) => (

                            <div
                                key={item}
                                className="h-44 animate-pulse rounded-2xl bg-slate-200"
                            />

                        )
                    )}

                </div>

            )}


            {/* Empty */}

            {!loading &&
                emergencies.length === 0 && (

                    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                        <ShieldAlert
                            size={44}
                            className="mx-auto text-slate-300"
                        />

                        <h2 className="mt-4 text-xl font-bold text-slate-800">
                            No emergency resources
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Add an emergency resource to make it available to students.
                        </p>

                        <button
                            type="button"
                            onClick={openCreateForm}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                        >

                            <Plus size={18} />

                            Add Resource

                        </button>

                    </div>

                )}


            {/* Resources */}

            {!loading &&
                emergencies.length > 0 && (

                    <div className="mt-8 grid gap-5 md:grid-cols-2">

                        {emergencies.map(
                            (resource) => (

                                <article
                                    key={resource.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                                >

                                    <div className="flex items-start justify-between gap-4">

                                        <div className="flex items-start gap-3">

                                            <div className="rounded-xl bg-red-50 p-3">

                                                <Phone
                                                    size={22}
                                                    className="text-red-600"
                                                />

                                            </div>

                                            <div>

                                                <h2 className="text-lg font-bold text-slate-900">
                                                    {resource.name}
                                                </h2>

                                                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    {resource.category}
                                                </p>

                                            </div>

                                        </div>


                                        <span
                                            className={
                                                resource.is_active
                                                    ? "rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                                                    : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
                                            }
                                        >
                                            {resource.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>

                                    </div>


                                    <div className="mt-5 space-y-2 text-sm">

                                        <p className="text-slate-500">

                                            <span className="font-semibold text-slate-700">
                                                Disaster:
                                            </span>{" "}

                                            {getDisasterName(
                                                resource.disaster_id
                                            )}

                                        </p>


                                        {resource.phone && (

                                            <p className="text-slate-600">

                                                <span className="font-semibold text-slate-700">
                                                    Phone:
                                                </span>{" "}

                                                {resource.phone}

                                            </p>

                                        )}


                                        {resource.description && (

                                            <p className="leading-6 text-slate-600">
                                                {resource.description}
                                            </p>

                                        )}

                                    </div>


                                    {/* Actions */}

                                    <div className="mt-6 flex gap-3 border-t border-slate-100 pt-4">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEditForm(
                                                    resource
                                                )
                                            }
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                        >

                                            <Edit size={16} />

                                            Edit

                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    resource
                                                )
                                            }
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                                        >

                                            <Trash2 size={16} />

                                            Delete

                                        </button>

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                )}


            {/* Form Modal */}

            {showForm && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b px-6 py-5">

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingId !== null
                                        ? "Edit Emergency Resource"
                                        : "Add Emergency Resource"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Enter the emergency contact details.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >

                            {/* Disaster */}

                            <div>

                                <label
                                    htmlFor="emergency-disaster"
                                    className="block text-sm font-semibold text-slate-700"
                                >
                                    Disaster
                                </label>

                                <select
                                    id="emergency-disaster"
                                    value={
                                        form.disaster_id ?? ""
                                    }
                                    onChange={(event) => {

                                        const value =
                                            event.target.value;

                                        setForm(
                                            (previous) => ({
                                                ...previous,
                                                disaster_id:
                                                    value
                                                        ? Number(value)
                                                        : null,
                                            })
                                        );

                                    }}
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >

                                    <option value="">
                                        All disasters / General
                                    </option>

                                    {disasters.map(
                                        (disaster) => (

                                            <option
                                                key={disaster.id}
                                                value={disaster.id}
                                            >
                                                {disaster.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* Name */}

                            <div>

                                <label
                                    htmlFor="emergency-name"
                                    className="block text-sm font-semibold text-slate-700"
                                >
                                    Resource Name
                                </label>

                                <input
                                    id="emergency-name"
                                    type="text"
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm(
                                            (previous) => ({
                                                ...previous,
                                                name:
                                                    event.target.value,
                                            })
                                        )
                                    }
                                    placeholder="e.g. Fire and Rescue"
                                    maxLength={150}
                                    required
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            {/* Category */}

                            <div>

                                <label
                                    htmlFor="emergency-category"
                                    className="block text-sm font-semibold text-slate-700"
                                >
                                    Category
                                </label>

                                <input
                                    id="emergency-category"
                                    type="text"
                                    value={form.category}
                                    onChange={(event) =>
                                        setForm(
                                            (previous) => ({
                                                ...previous,
                                                category:
                                                    event.target.value,
                                            })
                                        )
                                    }
                                    placeholder="e.g. Fire, Police, Medical"
                                    maxLength={50}
                                    required
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            {/* Phone */}

                            <div>

                                <label
                                    htmlFor="emergency-phone"
                                    className="block text-sm font-semibold text-slate-700"
                                >
                                    Phone Number
                                </label>

                                <input
                                    id="emergency-phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={(event) =>
                                        setForm(
                                            (previous) => ({
                                                ...previous,
                                                phone:
                                                    event.target.value,
                                            })
                                        )
                                    }
                                    placeholder="e.g. 112"
                                    maxLength={30}
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            {/* Description */}

                            <div>

                                <label
                                    htmlFor="emergency-description"
                                    className="block text-sm font-semibold text-slate-700"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="emergency-description"
                                    value={form.description}
                                    onChange={(event) =>
                                        setForm(
                                            (previous) => ({
                                                ...previous,
                                                description:
                                                    event.target.value,
                                            })
                                        )
                                    }
                                    placeholder="Describe when and how this resource should be used."
                                    rows={4}
                                    className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            {/* Active */}

                            {editingId !== null && (

                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">

                                    <input
                                        type="checkbox"
                                        checked={
                                            form.is_active
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (previous) => ({
                                                    ...previous,
                                                    is_active:
                                                        event.target.checked,
                                                })
                                            )
                                        }
                                        className="h-4 w-4 rounded border-slate-300"
                                    />

                                    <div>

                                        <p className="text-sm font-semibold text-slate-800">
                                            Active resource
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            Active resources are visible to students.
                                        </p>

                                    </div>

                                </label>

                            )}


                            {/* Buttons */}

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId !== null
                                            ? "Update Resource"
                                            : "Create Resource"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};


export default AdminEmergencies;