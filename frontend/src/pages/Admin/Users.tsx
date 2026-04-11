import React, { useEffect, useState } from "react";
import axios from "../../axios";

type User = {
  id: number;
  name: string;
  citizenshipNumber: string;
  email: string;
};

const Users = () => {
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [verifiedUsers, setVerifiedUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<"pending" | "registry">("pending");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async (initialLoad = false) => {
        if (initialLoad) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            const [pendingRes, verifiedRes] = await Promise.all([
                axios.get("/users/all"),
                axios.get("/users/verified")
            ]);
            setPendingUsers(pendingRes.data.users);
            setVerifiedUsers(verifiedRes.data.users);
        } catch (error) {
            console.log({ error });
        } finally {
            if (initialLoad) {
                setLoading(false);
            }

            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData(true);

        const interval = setInterval(() => {
            fetchData(false);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const verifyUser = (id: number | string) => {
        axios
            .post("/users/verify", { userId: id })
            .then(() => fetchData())
            .catch((error) => console.log({ error }));
    };

    const revokeUser = (id: number | string) => {
        if (window.confirm("Are you sure you want to revoke this voter's verification? They will no longer be able to cast votes.")) {
            axios
                .post("/users/revoke", { userId: id })
                .then(() => fetchData())
                .catch((error) => console.log({ error }));
        }
    };

    const deleteUser = (id: number | string) => {
        if (window.confirm("Permanently delete this registration request?")) {
            axios
                .delete(`/users/delete/${id}`)
                .then(() => fetchData())
                .catch((error) => console.log({ error }));
        }
    };

    if (loading) return <div className="loading-state">Loading Voter Management System...</div>;

    const currentList = activeTab === "pending" ? pendingUsers : verifiedUsers;

    return (
        <div className="admin-dashboard-container">
            <div className="dashboard-header">
                <h2 className="title-small">Voter Management System</h2>
                <p className="text-normal">Review registration requests and manage the active voter registry.</p>
                                <button
                                    onClick={() => fetchData(false)}
                                    className="button-secondary"
                                    style={{ marginTop: '12px', minWidth: '180px' }}
                                    disabled={refreshing}
                                >
                                    {refreshing ? 'Refreshing...' : 'Refresh Requests'}
                                </button>
            </div>

            <div className="tab-navigation" style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <button 
                  onClick={() => setActiveTab("pending")}
                  className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: activeTab === 'pending' ? '#6366f1' : '#94a3b8',
                    borderBottom: activeTab === 'pending' ? '2px solid #6366f1' : 'none',
                    padding: '10px 0',
                    borderRadius: '0'
                  }}
                >
                    Pending Requests ({pendingUsers.length})
                </button>
                <button 
                  onClick={() => setActiveTab("registry")}
                  className={`tab-item ${activeTab === 'registry' ? 'active' : ''}`}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: activeTab === 'registry' ? '#14b8a6' : '#94a3b8',
                    borderBottom: activeTab === 'registry' ? '2px solid #14b8a6' : 'none',
                    padding: '10px 0',
                    borderRadius: '0'
                  }}
                >
                    Active Voter Registry ({verifiedUsers.length})
                </button>
            </div>
            
            <div className="users-wrapper dashboard-content">
                {currentList.length === 0 ? (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                        <i className={`bi ${activeTab === 'pending' ? 'bi-person-check' : 'bi-people'}`} style={{ fontSize: '3rem', marginBottom: '15px', display: 'block' }}></i>
                        <p>{activeTab === 'pending' ? 'No pending verification requests.' : 'The voter registry is currently empty.'}</p>
                    </div>
                ) : (
                    currentList.map((user, index) => (
                        <div key={index} className="user-wrapper card-premium" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="user-info">
                                <div className="user-name" style={{ fontSize: '1.2rem', fontWeight: '600' }}>{user.name}</div>
                                <div className="user-email" style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{user.email}</div>
                                <div className="user-id" style={{ marginTop: '10px', color: activeTab === 'pending' ? '#6366f1' : '#14b8a6', fontWeight: '500' }}>
                                    <i className="bi bi-card-text" style={{ marginRight: '8px' }}></i>
                                    Voter ID: {user.citizenshipNumber}
                                </div>
                            </div>

                            <div className="user-actions">
                                {activeTab === "pending" ? (
                                    <>
                                        <button
                                            onClick={() => verifyUser(user.id)}
                                            className="button-primary"
                                            style={{ padding: '8px 20px' }}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user.id)}
                                            className="button-black"
                                            style={{ padding: '8px 20px', marginLeft: '10px' }}
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => revokeUser(user.id)}
                                        className="button-secondary"
                                        style={{ padding: '8px 20px', color: '#ef4444' }}
                                    >
                                        Revoke Access
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Users;
