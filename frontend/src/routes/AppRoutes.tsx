import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import Login from "../pages/auth/Login";

import StudentDashboard from "../pages/student/StudentDashboard";
import Emergency from "../pages/student/Emergency";
import StudentLessons from "../pages/student/StudentLessons";
import LessonDetails from "../pages/student/LessonDetails";
import StudentQuizzes from "../pages/student/StudentQuizzes";
import QuizAttempt from "../pages/student/QuizAttempt";
import StudentSimulations from "../pages/student/StudentSimulations";
import SimulationAttempt from "../pages/student/SimulationAttempt";
import AITutor from "../pages/student/AITutor";
import Announcements from "../pages/student/Announcements";

import AdminAnnouncements from "../pages/admin/AdminAnnouncements";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";

import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import AdminSimulations from "../pages/admin/AdminSimulations";
import StudentLayout from "../layouts/StudentLayout";
import AdminDisasters from "../pages/admin/AdminDisasters";
import AdminLessons from "../pages/admin/AdminLessons";
import AdminQuizzes from "../pages/admin/AdminQuizzes";
import AdminEmergencies from "../pages/admin/AdminEmergencies";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminInstitutions from "../pages/admin/AdminInstitutions";

const FacultyDashboard = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-900">
                Faculty Dashboard
            </h1>

            <p className="mt-2 text-slate-500">
                Faculty dashboard module.
            </p>
        </div>
    );
};


const AppRoutes = () => {
    return (
        <Routes>

            {/* =========================================
                PUBLIC ROUTES
            ========================================= */}

            <Route
                path="/login"
                element={<Login />}
            />


            {/* =========================================
                PROTECTED ROUTES
            ========================================= */}

            <Route element={<ProtectedRoute />}>


                {/* =====================================
                    STUDENT ROUTES
                ===================================== */}

                <Route
                    element={
                        <RoleProtectedRoute
                            allowedRoles={["STUDENT"]}
                        />
                    }
                >

                    <Route element={<StudentLayout />}>

                        <Route
                            path="/student/dashboard"
                            element={<StudentDashboard />}
                        />

                        <Route
                            path="/student/lessons"
                            element={<StudentLessons />}
                        />

                        <Route
                            path="/student/lessons/:lessonId"
                            element={<LessonDetails />}
                        />

                        <Route
                            path="/student/quizzes"
                            element={<StudentQuizzes />}
                        />

                        <Route
                            path="/student/quizzes/:quizId"
                            element={<QuizAttempt />}
                        />

                        <Route
                            path="/student/simulations"
                            element={<StudentSimulations />}
                        />

                        <Route
                            path="/student/simulations/:simulationId"
                            element={<SimulationAttempt />}
                        />

                        <Route
                            path="/student/ai-tutor"
                            element={<AITutor />}
                        />

                        <Route
                            path="/student/emergency"
                            element={<Emergency />}
                        />

                        <Route
                            path="/student/announcements"
                            element={<Announcements />}
                        />

                    </Route>

                </Route>


                {/* =====================================
                    FACULTY ROUTES
                ===================================== */}

                <Route
                    element={
                        <RoleProtectedRoute
                            allowedRoles={["FACULTY"]}
                        />
                    }
                >

                    <Route
                        path="/faculty/dashboard"
                        element={<FacultyDashboard />}
                    />

                </Route>


                {/* =====================================
                    ADMIN ROUTES
                ===================================== */}

                <Route
                    element={
                        <RoleProtectedRoute
                            allowedRoles={[
                                "ADMIN",
                                "INSTITUTION_ADMIN",
                            ]}
                        />
                    }
                >

                    <Route element={<AdminLayout />}>

                        <Route
                            path="/admin/dashboard"
                            element={<AdminDashboard />}
                        />

                        <Route
                            path="/admin/announcements"
                            element={<AdminAnnouncements />}
                        />

                        <Route
                            path="/admin/disasters"
                            element={<AdminDisasters />}
                        />
                        <Route
                            path="/admin/institutions"
                            element={<AdminInstitutions />}
                        />

                        <Route
                            path="/admin/lessons"
                            element={<AdminLessons />}
                        />

                        <Route
                            path="/admin/quizzes"
                            element={<AdminQuizzes />}
                        />

                        <Route
                            path="/admin/simulations"
                            element={<AdminSimulations />}
                        />

                        <Route
                            path="/admin/emergencies"
                            element={<AdminEmergencies />}
                        />

                        <Route
                            path="/admin/users"
                            element={<AdminUsers />}
                        />


                    </Route>

                </Route>

            </Route>


            {/* =========================================
                DEFAULT ROUTES
            ========================================= */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>
    );
};


export default AppRoutes;