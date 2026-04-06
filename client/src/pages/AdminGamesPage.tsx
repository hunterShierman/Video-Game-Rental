import Navbar from '../components/NavBar';
import { useEffect, useState } from 'react';
import {
  getAllGames,
  createGame,
  updateGame,
  deleteGame,
} from '../services/gameService';
import type { Game, CreateGameInput, UpdateGameInput } from '../types/definitions';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Gamepad2,
  Search,
  Settings2,
} from 'lucide-react';

type ModalMode = 'closed' | 'add' | 'edit';

const GENRE_OPTIONS = [
  'Action',
  'Adventure',
  'RPG',
  'Shooter',
  'Sports',
  'Racing',
  'Puzzle',
  'Strategy',
  'Simulation',
  'Horror',
  'Fighting',
  'Platformer',
  'Other',
];

const PLATFORM_OPTIONS = [
  'Arcade',
  'Atari 2600',
  'Atari 7800',
  'NES',
  'Sega Master System',
  'Game Boy',
  'Sega Genesis',
  'Super Nintendo (SNES)',
  'Game Boy Color',
  'Nintendo 64',
  'PlayStation',
  'Sega Saturn',
  'Other',
];

const emptyForm: CreateGameInput = {
  title: '',
  description: '',
  genre: '',
  platform: '',
  release_year: undefined,
  price: 0,
  image_url: '',
  total_copies: 1,
  available_copies: 1,
};

function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>('closed');
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [form, setForm] = useState<CreateGameInput>(emptyForm);
  const [priceText, setPriceText] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load games
  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      try {
        const data = await getAllGames();
        setGames(data);
      } catch (err) {
        console.error('Failed to load games:', err);
      }
      setLoading(false);
    };

    void loadGames();
  }, []);

  const filteredGames = games.filter((g) =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Modal handlers ---
  const openAdd = () => {
    setForm(emptyForm);
    setPriceText('');
    setEditingGame(null);
    setFormError('');
    setModalMode('add');
  };

  const openEdit = (game: Game) => {
    setForm({
      title: game.title,
      description: game.description ?? '',
      genre: game.genre,
      platform: game.platform,
      release_year: game.release_year ?? undefined,
      price: game.price,
      image_url: game.image_url ?? '',
      total_copies: game.total_copies,
      available_copies: game.available_copies,
    });
    setPriceText(String(game.price));
    setEditingGame(game);
    setFormError('');
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode('closed');
    setEditingGame(null);
    setFormError('');
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'total_copies' || name === 'available_copies' || name === 'release_year'
        ? (value === '' ? undefined : Number(value))
        : value,
    }));
  };

  const handleSave = async () => {
    setFormError('');

    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!form.genre) {
      setFormError('Genre is required.');
      return;
    }
    if (!form.platform) {
      setFormError('Platform is required.');
      return;
    }
    const parsedPrice = parseFloat(priceText);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError('Price must be a valid non-negative number.');
      return;
    }
    const finalForm = { ...form, price: parsedPrice };

    setSaving(true);
    try {
      if (modalMode === 'add') {
        const created = await createGame(finalForm);
        setGames((prev) => [...prev, created].sort((a, b) => a.title.localeCompare(b.title)));
      } else if (modalMode === 'edit' && editingGame) {
        const updates: UpdateGameInput = {
          title: finalForm.title,
          description: finalForm.description || undefined,
          genre: finalForm.genre,
          platform: finalForm.platform,
          release_year: finalForm.release_year ?? null,
          price: finalForm.price,
          image_url: finalForm.image_url || undefined,
          total_copies: finalForm.total_copies,
          available_copies: finalForm.available_copies,
        };
        const updated = await updateGame(editingGame.id, updates);
        setGames((prev) =>
          prev.map((g) => (g.id === updated.id ? updated : g))
        );
      }
      closeModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setFormError(message);
    }
    setSaving(false);
  };

  // --- Delete handlers ---
  const confirmDelete = (game: Game) => {
    setDeleteTarget(game);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteGame(deleteTarget.id);
      setGames((prev) => prev.filter((g) => g.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete game:', err);
    }
    setDeleting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <Navbar />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-4">
                <Settings2 className="w-4 h-4 text-indigo-300" />
                <span className="text-sm font-semibold text-indigo-200">Admin Controls</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">Manage Games</h1>
              <p className="text-gray-400 text-lg">Add, edit, and remove games from the catalog.</p>
            </div>

            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30 shrink-0"
            >
              <Plus className="w-5 h-5" />
              Add Game
            </button>
          </div>

          {/* Search */}
          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search games by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/60 border border-indigo-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Games list */}
          {loading ? (
            <div className="rounded-xl border border-indigo-500/25 bg-slate-900/40 px-4 py-3 text-sm text-indigo-200">
              Loading games...
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="rounded-xl border border-indigo-500/25 bg-slate-900/40 px-6 py-10 text-center">
              <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">
                {searchTerm ? 'No games match your search.' : 'No games in the catalog yet.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {/* Table header */}
              <div className="hidden md:grid md:grid-cols-[80px_2fr_1fr_1fr_70px_100px_80px_80px_120px] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <span>Image</span>
                <span>Title</span>
                <span>Genre</span>
                <span>Platform</span>
                <span>Year</span>
                <span>Price</span>
                <span>Copies</span>
                <span>Avail.</span>
                <span className="text-right">Actions</span>
              </div>

              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className="grid grid-cols-1 md:grid-cols-[80px_2fr_1fr_1fr_70px_100px_80px_80px_120px] gap-4 items-center px-5 py-4 rounded-xl border border-indigo-500/20 bg-slate-900/50 hover:border-indigo-500/40 transition-colors"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800/60 shrink-0">
                    {game.image_url ? (
                      <img
                        src={game.image_url}
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-slate-600" />
                      </div>
                    )}
                  </div>

                  {/* Title + description */}
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{game.title}</p>
                    {game.description && (
                      <p className="text-gray-500 text-sm truncate">{game.description}</p>
                    )}
                  </div>

                  {/* Genre */}
                  <span className="text-sm text-gray-300">
                    <span className="md:hidden text-gray-500 mr-1">Genre:</span>
                    {game.genre}
                  </span>

                  {/* Platform */}
                  <span className="text-sm text-gray-300">
                    <span className="md:hidden text-gray-500 mr-1">Platform:</span>
                    {game.platform}
                  </span>

                  {/* Year */}
                  <span className="text-sm text-gray-300">
                    <span className="md:hidden text-gray-500 mr-1">Year:</span>
                    {game.release_year ?? '—'}
                  </span>

                  {/* Price */}
                  <span className="text-sm text-indigo-300 font-semibold">
                    <span className="md:hidden text-gray-500 mr-1 font-normal">Price:</span>
                    ${game.price}
                  </span>

                  {/* Total copies */}
                  <span className="text-sm text-gray-300">
                    <span className="md:hidden text-gray-500 mr-1">Total:</span>
                    {game.total_copies}
                  </span>

                  {/* Available copies */}
                  <span className={`text-sm font-semibold ${game.available_copies > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="md:hidden text-gray-500 mr-1 font-normal">Avail.:</span>
                    {game.available_copies}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2 md:justify-end">
                    <button
                      onClick={() => openEdit(game)}
                      className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/30 hover:text-white transition-colors"
                      title="Edit game"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(game)}
                      className="p-2 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/30 hover:text-white transition-colors"
                      title="Delete game"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== Add / Edit Modal ===== */}
      {modalMode !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl border border-indigo-500/30 bg-slate-950 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-500/20">
              <h2 className="text-xl font-bold text-white">
                {modalMode === 'add' ? 'Add New Game' : 'Edit Game'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-indigo-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                  placeholder="Game title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description ?? ''}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-indigo-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                  placeholder="Brief description of the game"
                />
              </div>

              {/* Genre + Platform row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Genre <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="genre"
                    value={form.genre}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-indigo-500/20 text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="">Select genre</option>
                    {GENRE_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Platform <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="platform"
                    value={form.platform}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-indigo-500/20 text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="">Select platform</option>
                    {PLATFORM_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Release Year */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Release Year <span className="text-gray-500 font-normal">(1970–1999)</span>
                </label>
                <input
                  name="release_year"
                  type="number"
                  min="1970"
                  max="1999"
                  value={form.release_year ?? ''}
                  onChange={handleFormChange}
                  placeholder="e.g. 1994"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-indigo-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {/* Price + Copies row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Price ($)
                  </label>
                  <input
                    name="price"
                    type="text"
                    inputMode="decimal"
                    value={priceText}
                    onChange={(e) => setPriceText(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-indigo-500/20 text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Total Copies
                  </label>
                  <input
                    name="total_copies"
                    type="number"
                    min="0"
                    value={form.total_copies}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-indigo-500/20 text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Available
                  </label>
                  <input
                    name="available_copies"
                    type="number"
                    min="0"
                    value={form.available_copies}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-indigo-500/20 text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                <input
                  name="image_url"
                  value={form.image_url ?? ''}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-indigo-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                  placeholder="https://example.com/image.jpg"
                />
                {form.image_url && (
                  <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-slate-800/60">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-indigo-500/20">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? 'Saving...'
                  : modalMode === 'add'
                    ? 'Add Game'
                    : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Confirmation Modal ===== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-950 shadow-2xl">
            <div className="px-6 py-5">
              <h2 className="text-xl font-bold text-white mb-2">Delete Game</h2>
              <p className="text-gray-400">
                Are you sure you want to permanently delete{' '}
                <span className="text-white font-semibold">{deleteTarget.title}</span>? This action
                cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-red-500/20">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminGamesPage;
