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

import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";

import StudentLayout from "../layouts/StudentLayout";
import StudentQuizzes from "../pages/student/StudentQuizzes";
import QuizAttempt from "../pages/student/QuizAttempt";
import StudentSimulations from "../pages/student/StudentSimulations";
import SimulationAttempt from "../pages/student/SimulationAttempt";
import AITutor from "../pages/student/AITutor";
import Announcements from "../pages/student/Announcements";



const FacultyDashboard = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">
                Faculty Dashboard
            </h1>
        </div>
    );
};


const AdminDashboard = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">
                Admin Dashboard
            </h1>
        </div>
    );
};


const AppRoutes = () => {
    return (
        <Routes>

            <Route
                path="/login"
                element={<Login />}
            />

            <Route element={<ProtectedRoute />}>

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
                            element={
                                <Announcements />
                            }
                        />

                    </Route>

                </Route>

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

                    <Route
                        path="/admin/dashboard"
                        element={<AdminDashboard />}
                    />

                </Route>

            </Route>

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



