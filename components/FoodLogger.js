"use client";
import { useState, useEffect, useCallback } from "react";
import { getUserId, isNewDay } from "../lib/userManager";

export default function FoodLogger() {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().slice(0, 10));

  // Nutrition goals
  const goals = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65
  };

  // Initialize user ID and load data
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    loadEntries(id, currentDate);
  }, []);

  // Check for new day and reset if needed
  useEffect(() => {
    const checkNewDay = () => {
      if (isNewDay()) {
        const today = new Date().toISOString().slice(0, 10);
        setCurrentDate(today);
        setEntries([]);
        loadEntries(userId, today);
      }
    };

    // Check every minute
    const interval = setInterval(checkNewDay, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  // Auto-refresh data every 30 seconds for real-time sync
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      loadEntries(userId, currentDate);
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, currentDate]);

  const loadEntries = useCallback(async (id, date) => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/logFood?userId=${id}&date=${date}`);
      
      if (!response.ok) {
        throw new Error('Failed to load entries');
      }
      
      const data = await response.json();
      setEntries(data);
      setError(null);
    } catch (err) {
      console.error('Error loading entries:', err);
      setError('Failed to load entries. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdd = async () => {
    if (!input.trim() || !userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/logFood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          food: input, 
          userId: userId,
          date: currentDate 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add food entry');
      }

      const newEntry = await response.json();
      setEntries(prev => [...prev, newEntry]);
      setInput("");
    } catch (err) {
      console.error('Error adding entry:', err);
      setError(err.message || 'Failed to add food entry');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleAdd();
    }
  };

  const handleDelete = async (entryId) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/logFood?id=${entryId}&userId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete entry');
      }

      // Remove the entry from local state
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError(err.message || 'Failed to delete entry');
    } finally {
      setLoading(false);
    }
  };

  // Compute totals
  const totals = entries.reduce(
    (t, e) => ({
      calories: t.calories + (e.calories || 0),
      protein: t.protein + (e.protein || 0),
      carbs: t.carbs + (e.carbs || 0),
      fats: t.fats + (e.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  // Calculate percentages
  const percentages = {
    calories: Math.min((totals.calories / goals.calories) * 100, 100),
    protein: Math.min((totals.protein / goals.protein) * 100, 100),
    carbs: Math.min((totals.carbs / goals.carbs) * 100, 100),
    fats: Math.min((totals.fats / goals.fats) * 100, 100)
  };

  if (!userId) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%)",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ textAlign: "center", color: "#666" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%)",
      padding: "2rem",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "700", 
            color: "#2d3748", 
            margin: "0 0 0.5rem 0" 
          }}>
            Food Logger
          </h1>
          <p style={{ color: "#718096", fontSize: "1.1rem", margin: 0 }}>
            Track your daily nutrition
          </p>
        </div>

        {/* Nutrition Summary Cards */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "1.5rem", 
          marginBottom: "2rem" 
        }}>
          {/* Calories Card */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.2rem"
                }}>
                  ⚡
                </div>
                <span style={{ fontWeight: "600", color: "#2d3748" }}>Calories</span>
              </div>
              <span style={{ 
                fontSize: "0.9rem", 
                fontWeight: "600", 
                color: "#718096" 
              }}>
                {Math.round(percentages.calories)}%
              </span>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <span style={{ 
                fontSize: "2rem", 
                fontWeight: "700", 
                color: "#2d3748" 
              }}>
                {totals.calories.toFixed(1)}
              </span>
              <span style={{ 
                fontSize: "1rem", 
                color: "#718096", 
                marginLeft: "0.5rem" 
              }}>
                / {goals.calories} cal
              </span>
            </div>
            <div style={{
              width: "100%",
              height: "8px",
              background: "#f7fafc",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${percentages.calories}%`,
                height: "100%",
                background: "linear-gradient(90deg, #ff6b35, #f7931e)",
                borderRadius: "4px",
                transition: "width 0.3s ease"
              }} />
            </div>
          </div>

          {/* Protein Card */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #805ad5, #9f7aea)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.2rem"
                }}>
                  🥩
                </div>
                <span style={{ fontWeight: "600", color: "#2d3748" }}>Protein</span>
              </div>
              <span style={{ 
                fontSize: "0.9rem", 
                fontWeight: "600", 
                color: "#718096" 
              }}>
                {Math.round(percentages.protein)}%
              </span>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <span style={{ 
                fontSize: "2rem", 
                fontWeight: "700", 
                color: "#2d3748" 
              }}>
                {totals.protein.toFixed(1)}
              </span>
              <span style={{ 
                fontSize: "1rem", 
                color: "#718096", 
                marginLeft: "0.5rem" 
              }}>
                / {goals.protein} g
              </span>
            </div>
            <div style={{
              width: "100%",
              height: "8px",
              background: "#f7fafc",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${percentages.protein}%`,
                height: "100%",
                background: "linear-gradient(90deg, #805ad5, #9f7aea)",
                borderRadius: "4px",
                transition: "width 0.3s ease"
              }} />
            </div>
          </div>

          {/* Carbs Card */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #38a169, #48bb78)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.2rem"
                }}>
                  🌾
                </div>
                <span style={{ fontWeight: "600", color: "#2d3748" }}>Carbs</span>
              </div>
              <span style={{ 
                fontSize: "0.9rem", 
                fontWeight: "600", 
                color: "#718096" 
              }}>
                {Math.round(percentages.carbs)}%
              </span>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <span style={{ 
                fontSize: "2rem", 
                fontWeight: "700", 
                color: "#2d3748" 
              }}>
                {totals.carbs.toFixed(1)}
              </span>
              <span style={{ 
                fontSize: "1rem", 
                color: "#718096", 
                marginLeft: "0.5rem" 
              }}>
                / {goals.carbs} g
              </span>
            </div>
            <div style={{
              width: "100%",
              height: "8px",
              background: "#f7fafc",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${percentages.carbs}%`,
                height: "100%",
                background: "linear-gradient(90deg, #38a169, #48bb78)",
                borderRadius: "4px",
                transition: "width 0.3s ease"
              }} />
            </div>
          </div>

          {/* Fats Card */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #805ad5, #9f7aea)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.2rem"
                }}>
                  🍎
                </div>
                <span style={{ fontWeight: "600", color: "#2d3748" }}>Fat</span>
              </div>
              <span style={{ 
                fontSize: "0.9rem", 
                fontWeight: "600", 
                color: "#718096" 
              }}>
                {Math.round(percentages.fats)}%
              </span>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <span style={{ 
                fontSize: "2rem", 
                fontWeight: "700", 
                color: "#2d3748" 
              }}>
                {totals.fats.toFixed(1)}
              </span>
              <span style={{ 
                fontSize: "1rem", 
                color: "#718096", 
                marginLeft: "0.5rem" 
              }}>
                / {goals.fats} g
              </span>
            </div>
            <div style={{
              width: "100%",
              height: "8px",
              background: "#f7fafc",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${percentages.fats}%`,
                height: "100%",
                background: "linear-gradient(90deg, #805ad5, #9f7aea)",
                borderRadius: "4px",
                transition: "width 0.3s ease"
              }} />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          minHeight: "500px"
        }}>
          {/* Left Column - Add Food Form */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #38a169, #48bb78)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "1rem"
              }}>
                +
              </div>
              <h2 style={{ 
                fontSize: "1.5rem", 
                fontWeight: "600", 
                color: "#2d3748", 
                margin: 0 
              }}>
                Add Food
              </h2>
            </div>

            {error && (
              <div style={{ 
                background: "#fed7d7", 
                border: "1px solid #feb2b2", 
                padding: "0.75rem", 
                borderRadius: "8px", 
                marginBottom: "1rem",
                color: "#c53030"
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ 
                display: "block", 
                fontSize: "0.9rem", 
                fontWeight: "500", 
                color: "#4a5568", 
                marginBottom: "0.5rem" 
              }}>
                What did you eat?
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 1 large apple, 2 slices of whole wheat bread with peanut butter"
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.2s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#38a169"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                disabled={loading}
              />
            </div>



            <button
              onClick={handleAdd}
              disabled={loading || !input.trim()}
              style={{
                width: "100%",
                padding: "1rem",
                background: loading || !input.trim() 
                  ? "#e2e8f0" 
                  : "linear-gradient(135deg, #38a169, #48bb78)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: loading || !input.trim() ? 0.6 : 1
              }}
            >
              {loading ? "Adding..." : "Add Food"}
            </button>
          </div>

          {/* Right Column - Logged Entries */}
          <div>
            <h2 style={{ 
              fontSize: "1.5rem", 
              fontWeight: "600", 
              color: "#2d3748", 
              margin: "0 0 1.5rem 0" 
            }}>
              Today's Log
            </h2>

            {loading && entries.length === 0 && (
              <div style={{ textAlign: "center", color: "#718096" }}>
                Loading entries...
              </div>
            )}

            {entries.length === 0 && !loading ? (
              <div style={{ 
                textAlign: "center", 
                padding: "3rem 1rem",
                color: "#a0aec0"
              }}>
                <div style={{ 
                  fontSize: "4rem", 
                  marginBottom: "1rem",
                  opacity: 0.3
                }}>
                  🖼️
                </div>
                <div style={{ 
                  fontSize: "1.1rem", 
                  fontWeight: "600", 
                  color: "#4a5568",
                  marginBottom: "0.5rem"
                }}>
                  No food logged today
                </div>
                <div style={{ fontSize: "0.9rem" }}>
                  Start tracking your nutrition by adding your first meal!
                </div>
              </div>
            ) : (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {entries.map((e) => (
                  <div 
                    key={e.id} 
                    style={{ 
                      padding: "1rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      marginBottom: "0.75rem",
                      background: "#fafafa",
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: "600", 
                          color: "#2d3748", 
                          marginBottom: "0.25rem" 
                        }}>
                          {e.description}
                        </div>
                        <div style={{ 
                          fontSize: "0.9rem", 
                          color: "#718096", 
                          marginBottom: "0.25rem" 
                        }}>
                          {e.calories} kcal • {e.protein}g protein • {e.carbs}g carbs • {e.fats}g fat
                        </div>
                        <div style={{ 
                          fontSize: "0.8rem", 
                          color: "#a0aec0" 
                        }}>
                          {new Date(e.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(e.id)}
                        disabled={loading}
                        style={{
                          background: "#fed7d7",
                          color: "#c53030",
                          border: "none",
                          borderRadius: "8px",
                          padding: "0.5rem",
                          fontSize: "1rem",
                          cursor: loading ? "not-allowed" : "pointer",
                          opacity: loading ? 0.6 : 1,
                          marginLeft: "0.75rem",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        title="Delete entry"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          textAlign: "center", 
          marginTop: "2rem",
          fontSize: "0.9rem", 
          color: "#a0aec0" 
        }}>
          Data syncs automatically across devices • Resets daily at midnight
        </div>
      </div>
    </div>
  );
}

