// import React, { useState, useEffect } from "react";
// import { Modal, Spin, message, Input, Button } from "antd";
// import { UserManager } from "oidc-client-ts";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   useNavigate,
// } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import PageDropdown from "./PageDropdown";

// // OIDC Configuration - Updated for Your Client
// const oidcConfig = {
//   authority: "https://ifsgcsc2-d02.demo.ifs.cloud/auth/realms/gcc2d021",
//   client_id: "IFS_digisigns",
//   redirect_uri: "http://localhost:5173/callback",
//   response_type: "code",
//   scope: "openid microprofile-jwt",
//   post_logout_redirect_uri: "https://ifsgcsc2-d02.demo.ifs.cloud/redirect",
// };

// const userManager = new UserManager(oidcConfig);

// function App() {
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [user, setUser] = useState(null);
//   const [tokens, setTokens] = useState(null);
//   const [decodedToken, setDecodedToken] = useState(null);
//   const [jsCode, setJsCode] = useState("");

//   const handleLogin = () => {
//     setIsModalVisible(true);
//     userManager.signinRedirect();
//   };

//   const handleLogout = () => {
//     userManager.signoutRedirect();
//   };

//   useEffect(() => {
//     userManager.getUser().then((loggedInUser) => {
//       if (loggedInUser) {
//         setUser(loggedInUser);
//         setTokens({
//           access_token: loggedInUser.access_token,
//           refresh_token: loggedInUser.refresh_token,
//           id_token: loggedInUser.id_token,
//         });

//         const decoded = jwtDecode(loggedInUser.refresh_token);
//         setDecodedToken(decoded);

//         // Generate JS Code for Copy
//         generateJsCode(loggedInUser.id_token, decoded.sub, decoded.sid);
//         message.success("Login successful!");
//       } else {
//         setUser(null);
//         setTokens(null);
//         setDecodedToken(null);
//         setJsCode("");
//       }
//     });
//   }, []);

//   const generateJsCode = (refreshToken, sub, sid) => {
//     const generatedJsCode = `
// (function() {
//   const cookies = {
//     KEYCLOAK_IDENTITY: '${refreshToken}',
//     KEYCLOAK_IDENTITY_LEGACY: '${refreshToken}',
//     KEYCLOAK_SESSION: '"gcc2d011/${sub}/${sid}"',
//     KEYCLOAK_SESSION_LEGACY: '"gcc2d011/${sub}/${sid}"'
//   };

//   Object.entries(cookies).forEach(([name, val]) => {
//     document.cookie = \`\${name}=\${val}; path=/auth/realms/gcc2d011/; domain=ifsgcsc2-d01.demo.ifs.cloud; Secure; SameSite=None;\`;
//   });

//   window.location.reload();
// })();
//     `.trim();
//     setJsCode(generatedJsCode);
//   };

//   const copyJsCode = () => {
//     navigator.clipboard.writeText(jsCode).then(() => {
//       message.success("JavaScript code copied to clipboard!");
//     });
//   };

//   return (
//     <Router>
//       <div className="min-h-screen w-[100vw] flex flex-col items-center justify-center bg-gray-900 text-white">
//         <h2 className="text-3xl font-bold mb-4">IFS Login Demo with OIDC</h2>
//         {!user ? (
//           <button
//             className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
//             onClick={handleLogin}
//           >
//             Login
//           </button>
//         ) : (
//           <div className="w-full max-w-5xl mt-5 p-4 bg-gray-800 text-white shadow-md rounded-lg">
//             <h3 className="text-xl font-semibold mb-4">
//               Welcome, {user.profile?.preferred_username || "User"}
//             </h3>
//             <button
//               className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition mb-4"
//               onClick={handleLogout}
//             >
//               Logout
//             </button>
//             <div className="mt-4">
//               <h4 className="text-lg font-bold mb-2">Select a Page:</h4>
//               <PageDropdown accessToken={tokens?.access_token} />
//             </div>
//             <div className="mt-4">
//               <h4 className="text-lg font-bold mb-2">
//                 Decoded Token Information:
//               </h4>
//               <pre className="overflow-auto bg-gray-700 p-4 rounded text-sm max-h-96">
//                 {decodedToken
//                   ? JSON.stringify(decodedToken, null, 2)
//                   : "No token data available"}
//               </pre>
//             </div>

//             <div className="mt-4">
//               <h4 className="text-lg font-bold mb-2">Raw Token Information:</h4>
//               <pre className="overflow-auto bg-gray-700 p-4 rounded text-sm max-h-96">
//                 {tokens
//                   ? JSON.stringify(tokens, null, 2)
//                   : "No token data available"}
//               </pre>
//             </div>

//             <div className="mt-4">
//               <h4 className="text-lg font-bold mb-2">JavaScript Code:</h4>
//               <Input.TextArea
//                 value={jsCode}
//                 rows={10}
//                 readOnly
//                 className="bg-gray-700 text-white"
//               />
//               <Button type="primary" className="mt-2" onClick={copyJsCode}>
//                 Copy JavaScript Code
//               </Button>
//             </div>
//           </div>
//         )}

//         <Modal
//           title="IFS Login"
//           open={isModalVisible}
//           footer={null}
//           closable={false}
//           maskClosable={false}
//           className="w-full max-w-lg"
//         >
//           <div className="flex justify-center items-center flex-col">
//             <Spin spinning={loading} size="large" />
//             <p className="mt-4 text-white">Loading IFS Login Page...</p>
//           </div>
//         </Modal>
//       </div>
//       <Routes>
//         <Route path="/" element={<AppContent user={user} />} />
//         <Route
//           path="/callback"
//           element={<Callback setUser={setUser} setTokens={setTokens} />}
//         />
//       </Routes>
//     </Router>
//   );
// }

// // Separate Component for Main Content
// function AppContent({ user }) {
//   return (
//     <div className="flex flex-col items-center mt-10">
//       {!user ? (
//         <p>Please login to continue.</p>
//       ) : (
//         <p>Welcome to the IFS OIDC Demo.</p>
//       )}
//     </div>
//   );
// }

// // Callback Component for OIDC Redirect Handling
// function Callback({ setUser, setTokens }) {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     userManager
//       .signinRedirectCallback()
//       .then((user) => {
//         setLoading(false);
//         setUser(user);
//         setTokens({
//           access_token: user.access_token,
//           refresh_token: user.refresh_token,
//           id_token: user.id_token,
//         });
//         navigate("/");
//       })
//       .catch((error) => {
//         setLoading(false);
//         navigate("/");
//         message.error("Login failed. Please try again.");
//       });
//   }, [navigate, setUser, setTokens]);

//   return (
//     <div className="flex flex-col items-center mt-10">
//       {loading ? <Spin size="large" /> : <p>Redirecting...</p>}
//     </div>
//   );
// }

// export default App;
