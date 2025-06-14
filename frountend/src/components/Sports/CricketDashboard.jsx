import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CricketDashboard() {
  const [countries, setCountries] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiKey = "b89c95b7-6c1a-45e8-8179-830c722205e8"; 

 useEffect(() => {
  const fetchData = async () => {
    try {
      const countriesRes = await axios.get(
        `https://api.cricapi.com/v1/countries?apikey=${apiKey}`
      );
      const matchesRes = await axios.get(
        `https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}`
      );
      setCountries(countriesRes.data.data);
      setMatches(matchesRes.data.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data from API.");
      setLoading(false);
    }
  };
  fetchData();
}, []);

useEffect(() => {
  console.log(matches, "12");
  console.log(countries, "13");
}, [matches, countries]);


  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">🏏 Cricket Dashboard</h1>

        {/* Countries */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-10">
          <h2 className="text-xl font-semibold mb-4">🌍 Available Countries</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {countries.map((country) => (
              <div
                key={country.id}
                className="bg-blue-100 text-blue-800 text-sm px-4 py-2 rounded-lg text-center"
              >
                {country.name}
              </div>
            ))}
          </div>
        </div>

        {/* Live Matches */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">📡 Live Matches</h2>
          {matches.length === 0 ? (
            <p className="text-gray-500">No matches available right now.</p>
          ) : (
            <div className="space-y-4">
              {matches.map((match, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50"
                >
                  <div className="font-medium text-lg">
                    {match.name || "Match"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {match.venue} — {match.date}
                  </div>
                  <div className="text-sm mt-2 text-green-600">
                    {match.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
