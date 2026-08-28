import {
    AlertTriangle,
    CheckCircle,
    Edit,
    Plus,
    Power,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    createDisaster,
    getDisasters,
    updateDisaster,
} from "../../api/disasters";

import type {
    Disaster,
} from "../../types/disaster";


interface DisasterForm {
    name: string;
    description: string;
    preparedness_guidelines: string;
    response_guidelines: string;
    recovery_guidelines: string;
}


const emptyForm: DisasterForm = {
    name: "",
    description: "",
    preparedness_guidelines: "",
    response_guidelines: "",
    recovery_guidelines: "",
};


const AdminDisasters = () => {

    const [disasters, setDisasters] =
        useState<Disaster[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [showModal, setShowModal] =
        useState(false);

    const [editingDisaster, setEditingDisaster] =
        useState<Disaster | null>(null);

    const [form, setForm] =
        useState<DisasterForm>(emptyForm);

    const [saving, setSaving] =
        useState(false);


    const loadDisasters =
        async () => {

            try {

                setLoading(true);
                setError(null);

                const data =
                    await getDisasters();

                setDisasters(data);

            } catch (err) {

                console.error(
                    "Failed to load disasters:",
                    err
                );

                setError(
                    "Failed to load disasters."
                );

            } finally {

                setLoading(false);

            }
        };


    useEffect(() => {

        loadDisasters();

    }, []);


    const openCreate =
        () => {

            setEditingDisaster(null);
            setForm(emptyForm);
            setShowModal(true);

        };


    const openEdit =
        (disaster: Disaster) => {

            setEditingDisaster(disaster);

            setForm({
                name: disaster.name,
                description:
                    disaster.description ?? "",
                preparedness_guidelines:
                    disaster.preparedness_guidelines ?? "",
                response_guidelines:
                    disaster.response_guidelines ?? "",
                recovery_guidelines:
                    disaster.recovery_guidelines ?? "",
            });

            setShowModal(true);

        };


    const closeModal =
        () => {

            if (saving) {
                return;
            }

            setShowModal(false);
            setEditingDisaster(null);
            setForm(emptyForm);

        };


    const handleChange =
        (
            field: keyof DisasterForm,
            value: string
        ) => {

            setForm(
                previous => ({
                    ...previous,
                    [field]: value,
                })
            );

        };


    const handleSubmit =
        async (
            event: React.FormEvent
        ) => {

            event.preventDefault();

            if (!form.name.trim()) {
                return;
            }

            try {

                setSaving(true);
                setError(null);

                if (editingDisaster) {

                    await updateDisaster(
                        editingDisaster.id,
                        {
                            name: form.name.trim(),
                            description:
                                form.description.trim() || null,
                            preparedness_guidelines:
                                form.preparedness_guidelines.trim() || null,
                            response_guidelines:
                                form.response_guidelines.trim() || null,
                            recovery_guidelines:
                                form.recovery_guidelines.trim() || null,
                        }
                    );

                } else {

                    await createDisaster({
                        name: form.name.trim(),
                        description:
                            form.description.trim() || null,
                        preparedness_guidelines:
                            form.preparedness_guidelines.trim() || null,
                        response_guidelines:
                            form.response_guidelines.trim() || null,
                        recovery_guidelines:
                            form.recovery_guidelines.trim() || null,
                    });

                }

                await loadDisasters();
                closeModal();

            } catch (err) {

                console.error(
                    "Failed to save disaster:",
                    err
                );

                setError(
                    "Failed to save disaster. Check the form and try again."
                );

            } finally {

                setSaving(false);

            }
        };


    const toggleActive =
        async (
            disaster: Disaster
        ) => {

            try {

                setError(null);

                await updateDisaster(
                    disaster.id,
                    {
                        is_active:
                            !disaster.is_active,
                    }
                );

                await loadDisasters();

            } catch (err) {

                console.error(
                    "Failed to update disaster status:",
                    err
                );

                setError(
                    "Failed to update disaster status."
                );

            }
        };


    return (
        <div className="min-h-screen bg-slate-50">

            <div className="mx-auto max-w-7xl p-6 lg:p-8">

                {/* Header */}

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                                <AlertTriangle
                                    size={26}
                                />

                            </div>

                            <div>

                                <h1 className="text-3xl font-bold text-slate-900">
                                    Disasters
                                </h1>

                                <p className="mt-1 text-slate-500">
                                    Create and manage disaster preparedness content.
                                </p>

                            </div>

                        </div>

                    </div>


                    <button
                        onClick={openCreate}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >

                        <Plus size={20} />

                        New Disaster

                    </button>

                </div>


                {/* Error */}

                {error && (

                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                        {error}

                    </div>

                )}


                {/* Content */}

                {loading ? (

                    <div className="rounded-xl border bg-white p-10 text-center text-slate-500">

                        Loading disasters...

                    </div>

                ) : disasters.length === 0 ? (

                    <div className="rounded-xl border bg-white p-12 text-center">

                        <AlertTriangle
                            size={42}
                            className="mx-auto text-slate-300"
                        />

                        <h2 className="mt-4 text-xl font-semibold text-slate-900">
                            No disasters found
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Create your first disaster to start adding educational content.
                        </p>

                        <button
                            onClick={openCreate}
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                        >

                            <Plus size={18} />

                            Create Disaster

                        </button>

                    </div>

                ) : (

                    <div className="grid gap-5">

                        {disasters.map(
                            disaster => (

                                <div
                                    key={disaster.id}
                                    className="rounded-xl border bg-white p-6 shadow-sm"
                                >

                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                        <div className="min-w-0 flex-1">

                                            <div className="flex flex-wrap items-center gap-3">

                                                <h2 className="text-xl font-bold text-slate-900">
                                                    {disaster.name}
                                                </h2>

                                                {disaster.is_active ? (

                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">

                                                        <CheckCircle
                                                            size={14}
                                                        />

                                                        Active

                                                    </span>

                                                ) : (

                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">

                                                        Inactive

                                                    </span>

                                                )}

                                            </div>


                                            <p className="mt-3 text-slate-600">

                                                {disaster.description ||
                                                    "No description provided."}

                                            </p>


                                            <div className="mt-5 grid gap-4 md:grid-cols-3">

                                                <div className="rounded-lg bg-blue-50 p-4">

                                                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                                                        Preparedness
                                                    </p>

                                                    <p className="mt-2 line-clamp-3 text-sm text-slate-700">

                                                        {disaster.preparedness_guidelines ||
                                                            "Not provided."}

                                                    </p>

                                                </div>


                                                <div className="rounded-lg bg-orange-50 p-4">

                                                    <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                                                        Response
                                                    </p>

                                                    <p className="mt-2 line-clamp-3 text-sm text-slate-700">

                                                        {disaster.response_guidelines ||
                                                            "Not provided."}

                                                    </p>

                                                </div>


                                                <div className="rounded-lg bg-green-50 p-4">

                                                    <p className="text-xs font-bold uppercase tracking-wide text-green-600">
                                                        Recovery
                                                    </p>

                                                    <p className="mt-2 line-clamp-3 text-sm text-slate-700">

                                                        {disaster.recovery_guidelines ||
                                                            "Not provided."}

                                                    </p>

                                                </div>

                                            </div>

                                        </div>


                                        <div className="flex shrink-0 gap-2">

                                            <button
                                                onClick={() =>
                                                    openEdit(disaster)
                                                }
                                                className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                            >

                                                <Edit
                                                    size={16}
                                                />

                                                Edit

                                            </button>


                                            <button
                                                onClick={() =>
                                                    toggleActive(
                                                        disaster
                                                    )
                                                }
                                                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium ${
                                                    disaster.is_active
                                                        ? "border-orange-300 text-orange-600 hover:bg-orange-50"
                                                        : "border-green-300 text-green-600 hover:bg-green-50"
                                                }`}
                                            >

                                                <Power
                                                    size={16}
                                                />

                                                {disaster.is_active
                                                    ? "Deactivate"
                                                    : "Activate"}

                                            </button>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>


            {/* Modal */}

            {showModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b px-6 py-4">

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">

                                    {editingDisaster
                                        ? "Edit Disaster"
                                        : "New Disaster"}

                                </h2>

                                <p className="mt-1 text-sm text-slate-500">

                                    Add the disaster information and safety guidelines.

                                </p>

                            </div>


                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >

                                <X size={20} />

                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Disaster Name
                                </label>

                                <input
                                    value={form.name}
                                    onChange={event =>
                                        handleChange(
                                            "name",
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. Earthquake"
                                    maxLength={100}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    value={form.description}
                                    onChange={event =>
                                        handleChange(
                                            "description",
                                            event.target.value
                                        )
                                    }
                                    rows={3}
                                    placeholder="Brief description of the disaster."
                                    className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Preparedness Guidelines
                                </label>

                                <textarea
                                    value={
                                        form.preparedness_guidelines
                                    }
                                    onChange={event =>
                                        handleChange(
                                            "preparedness_guidelines",
                                            event.target.value
                                        )
                                    }
                                    rows={5}
                                    placeholder="What should students do before the disaster?"
                                    className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Response Guidelines
                                </label>

                                <textarea
                                    value={
                                        form.response_guidelines
                                    }
                                    onChange={event =>
                                        handleChange(
                                            "response_guidelines",
                                            event.target.value
                                        )
                                    }
                                    rows={5}
                                    placeholder="What should students do during the disaster?"
                                    className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Recovery Guidelines
                                </label>

                                <textarea
                                    value={
                                        form.recovery_guidelines
                                    }
                                    onChange={event =>
                                        handleChange(
                                            "recovery_guidelines",
                                            event.target.value
                                        )
                                    }
                                    rows={5}
                                    placeholder="What should students do after the disaster?"
                                    className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            <div className="flex justify-end gap-3 border-t pt-5">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        !form.name.trim()
                                    }
                                    className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {saving
                                        ? "Saving..."
                                        : editingDisaster
                                            ? "Save Changes"
                                            : "Create Disaster"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};


export default AdminDisasters;
