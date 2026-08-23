import AITutorChat from "../../components/ai/AITutorChat";


function AITutor() {

    return (
        <div className="p-4 sm:p-6 lg:p-8">

            <div className="mx-auto max-w-7xl">

                <div className="mb-6">

                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                        AI Tutor
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                        Get help understanding disaster preparedness, response, and recovery.
                    </p>

                </div>


                <AITutorChat />

            </div>

        </div>
    );
}


export default AITutor;
