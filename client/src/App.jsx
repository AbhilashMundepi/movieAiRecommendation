import { useState } from "react";
import './App.css'

function App() {
  const [input, setInput] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRecommendations = async () => {
    if (!input.trim()) {
      setError("Please enter your movie preference");
      return;
    }

    setLoading(true);
    setError("");
    setMovies([]);

    try {
      const res = await fetch("https://movieairecommendation.onrender.com/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setMovies(data.recommendations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>🎬 Movie Recommendation AI</h1>
        <p className="subtitle">
          Tell us what kind of movie you feel like watching
        </p>

        <textarea
          placeholder="Example: action movies with a strong female lead"
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={3}
        />

        <button onClick={getRecommendations} disabled={loading}>
          {loading ? "Finding movies..." : "Get Recommendations"}
        </button>

        {error && <p className="error">{error}</p>}

        {movies.length > 0 && (
          <div className="movies">
            {movies.map((movie, index) => (
              <div className="movie-card" key={index}>
                🍿 {movie}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;


