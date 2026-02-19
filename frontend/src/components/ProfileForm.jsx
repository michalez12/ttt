import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { Save, User } from 'lucide-react';

export default function ProfileForm() {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    firma_nazwa: '',
    firma_nip: '',
    firma_rachunek: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Błąd ładowania profilu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateProfile({
        firma_nazwa: profile.firma_nazwa,
        firma_nip: profile.firma_nip,
        firma_rachunek: profile.firma_rachunek,
      });
      setMessage('Dane zapisane pomyślnie!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Błąd zapisu: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="text-center py-12">Ładowanie profilu...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profil użytkownika</h1>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <User className="w-12 h-12 text-gray-400 mr-4" />
            <div>
              <h2 className="text-xl font-semibold">{profile.username}</h2>
              <p className="text-gray-600">{profile.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Dane firmy</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nazwa firmy
                  </label>
                  <input
                    type="text"
                    name="firma_nazwa"
                    value={profile.firma_nazwa || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="np. AUTO SERWIS KOWALSKI"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIP
                  </label>
                  <input
                    type="text"
                    name="firma_nip"
                    value={profile.firma_nip || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="np. 1234567890"
                    maxLength="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rachunek bankowy (IBAN)
                  </label>
                  <input
                    type="text"
                    name="firma_rachunek"
                    value={profile.firma_rachunek || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PL..."
                    maxLength="34"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Ten rachunek będzie używany jako zleceniodawca w eksportach XML
                  </p>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('Błąd') 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
