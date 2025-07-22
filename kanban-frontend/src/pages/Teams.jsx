import { useEffect, useState } from 'react';
import API from '../services/api';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [name, setName] = useState('');
  const [members, setMembers] = useState('');

  const fetchTeams = async () => {
    const res = await API.get('/teams');
    setTeams(res.data);
  };

 const createTeam = async () => {
  if (!name.trim()) return;

  console.log("Creating team...", name, members); // ✅ Add this line

  await API.post('/teams', {
    name,
    members: members.split(',').map((id) => id.trim()),
  });

  setName('');
  setMembers('');
  fetchTeams();
};


  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Team Management</h1>

      <div className="mb-4 space-y-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="Team Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Member IDs (comma separated)"
          value={members}
          onChange={(e) => setMembers(e.target.value)}
        />
        <button
          onClick={createTeam}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Team
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Your Teams</h2>
        {teams.map((team) => (
          <div key={team._id} className="bg-white shadow rounded p-3 mb-2">
            <h3 className="font-bold">{team.name}</h3>
            <p className="text-sm">Members:</p>
            <ul className="text-sm list-disc list-inside">
              {team.members.map((m) => (
                <li key={m._id}>{m.name || m.email}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;
