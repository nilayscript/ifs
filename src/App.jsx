import React, { useState, useEffect } from "react";
import { message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UserManager } from "oidc-client-ts";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

const oidcConfig = {
  authority: "https://ifsgcsc2-d02.demo.ifs.cloud/auth/realms/gcc2d021",
  client_id: "IFS_digisigns",
  redirect_uri: "https://ifs-demo.netlify.app/callback",
  response_type: "code",
  scope: "openid microprofile-jwt",
  post_logout_redirect_uri: "https://ifsgcsc2-d02.demo.ifs.cloud/redirect",
};

const BASE_URL = "https://api.v2.digisigns.in/api/v1";

const userManager = new UserManager(oidcConfig);

function App() {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [lobbies, setLobbies] = useState([]);
  const [loadingLobbies, setLoadingLobbies] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogin = () => userManager.signinRedirect();
  const handleLogout = () => userManager.signoutRedirect();

  const refreshTokens = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(
        `https://ifsgcsc2-d02.demo.ifs.cloud/auth/realms/gcc2d021/protocol/openid-connect/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: "IFS_digisigns",
            refresh_token: tokens.refresh_token,
            grant_type: "refresh_token",
          }),
        }
      );

      const result = await res.json();
      console.log("Refresh Response:", result);

      if (result?.data?.access_token) {
        setTokens({
          access_token: result.data.access_token,
          refresh_token: result.data.refresh_token,
        });
        message.success("Token refreshed!");
      } else {
        message.error(result.message || "Token refresh failed.");
      }
    } catch (err) {
      console.error("Token refresh error:", err);
      message.error("Error refreshing token.");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchLobbies = async () => {
    if (!tokens?.access_token) return;

    setLoadingLobbies(true);
    try {
      const res = await fetch(`${BASE_URL}/ifs/ifs-lobbies`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (res.ok && result?.data?.pages) {
        setLobbies(result.data.pages);
        message.success("Lobbies fetched");
      } else {
        message.error(result.message || "Failed to fetch lobbies.");
      }
    } catch (err) {
      console.error("Lobby fetch error:", err);
      message.error("Network error while fetching lobbies.");
    } finally {
      setLoadingLobbies(false);
    }
  };

  useEffect(() => {
    userManager.getUser().then((u) => {
      if (u) {
        setUser(u);
        setTokens({
          access_token: u.access_token,
          refresh_token: u.refresh_token,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (tokens?.access_token) fetchLobbies();
  }, [tokens]);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Router>
      <div className="min-h-screen w-[100vw] bg-gray-50 p-4">
        <div className="max-w-5xl mx-auto">
          {user ? (
            <>
              <div className="flex justify-between items-center mb-6 w-">
                <div className="space-x-3 flex items-center gap-2">
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </div>
                <div className="text-lg text-gray-700 font-medium">
                  USERNAME : {user.profile?.preferred_username}
                </div>
                <button
                  style={{
                    background: "white",
                    outline: "none",
                    border: "none",
                  }}
                  onClick={refreshTokens}
                  disabled={refreshing}
                >
                  {refreshing && <Spin indicator={antIcon} size="small" />}
                  {!refreshing && "Refresh Token"}
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Lobbies
                </h2>
                {loadingLobbies ? (
                  <div className="flex justify-center items-center py-20">
                    <Spin indicator={antIcon} tip="Loading lobbies..." />
                  </div>
                ) : lobbies.length === 0 ? (
                  <div className="text-gray-500">No lobbies found.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lobbies.map((lobby, index) => (
                      <div key={index} className="p-4 bg-white shadow rounded">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {lobby.pageTitle}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Page ID: {lobby.pageId}
                        </p>
                        <p className="text-xs text-gray-400">
                          Keywords: {lobby.keywords || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <h1 className="text-3xl font-bold mb-6 text-gray-800">
                IFS Login
              </h1>
              <button
                onClick={handleLogin}
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
              >
                Login
              </button>
            </div>
          )}
        </div>
        <Routes>
          <Route
            path="/callback"
            element={<Callback setUser={setUser} setTokens={setTokens} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

function Callback({ setUser, setTokens }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userManager
      .signinRedirectCallback()
      .then((u) => {
        setUser(u);
        setTokens({
          access_token: u.access_token,
          refresh_token: u.refresh_token,
        });
        navigate("/");
      })
      .catch(() => {
        message.error("Login failed.");
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [navigate, setUser, setTokens]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {loading ? <Spin size="large" /> : <h2>Redirecting...</h2>}
    </div>
  );
}

export default App;
