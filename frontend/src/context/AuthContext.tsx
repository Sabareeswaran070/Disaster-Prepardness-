import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    getCurrentUser,
    login as loginApi,
    type LoginRequest,
    type UserResponse,
} from "../api/auth";

interface AuthContextType {
    user: UserResponse | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<UserResponse>;
    logout: () => void;
}

const AuthContext = createContext<
    AuthContextType | undefined
>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({
    children,
}: AuthProviderProps) => {
    const [user, setUser] =
        useState<UserResponse | null>(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token =
                localStorage.getItem("access_token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const currentUser =
                    await getCurrentUser();

                setUser(currentUser);
            } catch {
                localStorage.removeItem(
                    "access_token"
                );
                localStorage.removeItem("user");

                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (
        data: LoginRequest
    ): Promise<UserResponse> => {
        const tokenResponse =
            await loginApi(data);

        localStorage.setItem(
            "access_token",
            tokenResponse.access_token
        );

        const currentUser =
            await getCurrentUser();

        localStorage.setItem(
            "user",
            JSON.stringify(currentUser)
        );

        setUser(currentUser);

        return currentUser;
    };

    const logout = () => {
        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem("user");

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: user !== null,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};