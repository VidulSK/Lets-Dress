import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Camera, X } from 'lucide-react';
import { AppNavbar } from '../components/AppNavbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { getImageDominantColor, getClosestColorName } from '../utils/colorDetection';

interface ClothingItem {
  id: string;
  image: string;
  gender: string;
  type: string;
  color: string;
  colorName: string;
  occasions: string;
  accessoryType: string;
  uploadedAt: number;
}

const OCCASION_OPTIONS = ['Casual', 'Smart Casual', 'Office wear', 'Semi-Formal (Party wear)', 'Sports wear'];

const MALE_TYPES = ['top', 'bottom', 'footwear', 'accessories'];
const FEMALE_TYPES = ['top', 'bottom', 'footwear', 'saree', 'frock', 'accessories'];

const MALE_ACCESSORIES = ['Watch', 'Sunglass', 'Chain', 'Ring'];
const FEMALE_ACCESSORIES = ['Watch', 'Sunglass', 'Necklace', 'Ring', 'Earrings', 'Bangles'];

// Category display labels and order
const MALE_CATEGORIES: { key: string; label: string }[] = [
  { key: 'top', label: 'Tops' },
  { key: 'bottom', label: 'Bottoms' },
  { key: 'footwear', label: 'Footwears' },
  { key: 'accessories', label: 'Accessories' },
];
const FEMALE_CATEGORIES: { key: string; label: string }[] = [
  { key: 'top', label: 'Tops' },
  { key: 'bottom', label: 'Bottoms' },
  { key: 'footwear', label: 'Footwears' },
  { key: 'saree', label: 'Sarees' },
  { key: 'frock', label: 'Frocks' },
  { key: 'accessories', label: 'Accessories' },
];

// ── Color Picker: sample color directly from the image via an off-screen canvas ─
function sampleImageColor(img: HTMLImageElement, xRatio: number, yRatio: number): string {
  const offscreen = document.createElement('canvas');
  offscreen.width = img.naturalWidth || img.width;
  offscreen.height = img.naturalHeight || img.height;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return '#808080';
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(
    Math.round(xRatio * offscreen.width),
    Math.round(yRatio * offscreen.height),
    1, 1
  ).data;
  return `#${px[0].toString(16).padStart(2, '0')}${px[1].toString(16).padStart(2, '0')}${px[2].toString(16).padStart(2, '0')}`;
}

export function WardrobePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);

  useEffect(() => {
    fetch('/api/wardrobe')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setItems(data); })
      .catch(console.error);
  }, []);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [type, setType] = useState('top');
  const [accessoryType, setAccessoryType] = useState('');
  const [occasions, setOccasions] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // Color picker state — pin is expressed as 0..1 ratios relative to preview image
  const [pinPos, setPinPos] = useState({ xRatio: 0.5, yRatio: 0.5 });
  const [pickedColor, setPickedColor] = useState('#808080');
  const [pickedColorName, setPickedColorName] = useState('gray');
  const [isDraggingPin, setIsDraggingPin] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const userGender = user?.gender || 'male';
  const typeOptions = userGender === 'female' ? FEMALE_TYPES : MALE_TYPES;
  const accessoryOptions = userGender === 'female' ? FEMALE_ACCESSORIES : MALE_ACCESSORIES;
  const categories = userGender === 'female' ? FEMALE_CATEGORIES : MALE_CATEGORIES;

  // Sample image color at the current pin ratio position
  const sampleFromImage = useCallback((xRatio: number, yRatio: number) => {
    const img = previewImgRef.current;
    if (!img || !img.complete) return;
    const col = sampleImageColor(img, xRatio, yRatio);
    setPickedColor(col);
    setPickedColorName(getClosestColorName(col));
  }, []);

  // Initialize color from detected dominant color
  const handleFileSelect = async (file: File) => {
    setCurrentFile(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      setPreviewImage(imageUrl);
      const col = await getImageDominantColor(file);
      setPickedColor(col);
      setPickedColorName(getClosestColorName(col));
      setPinPos({ xRatio: 0.5, yRatio: 0.5 });
    };
    reader.readAsDataURL(file);
  };

  // Pin drag handlers on the image preview overlay
  const updatePinFromCoords = useCallback((clientX: number, clientY: number) => {
    const container = previewContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const xRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const yRatio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setPinPos({ xRatio, yRatio });
    sampleFromImage(xRatio, yRatio);
  }, [sampleFromImage]);

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingPin(true);
    updatePinFromCoords(e.clientX, e.clientY);
  };
  const handleOverlayTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingPin(true);
    const t = e.touches[0];
    updatePinFromCoords(t.clientX, t.clientY);
  };

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingPin) return;
    updatePinFromCoords(e.clientX, e.clientY);
  }, [isDraggingPin, updatePinFromCoords]);
  const handleGlobalMouseUp = useCallback(() => setIsDraggingPin(false), []);
  const handleGlobalTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingPin) return;
    const t = e.touches[0];
    updatePinFromCoords(t.clientX, t.clientY);
  }, [isDraggingPin, updatePinFromCoords]);

  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchmove', handleGlobalTouchMove);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [handleGlobalMouseMove, handleGlobalMouseUp, handleGlobalTouchMove]);

  const handleUploadClick = () => {
    setShowUploadModal(true);
    setPreviewImage(null);
    setPickedColor('#808080');
    setPickedColorName('gray');
    setType('top');
    setAccessoryType('');
    setOccasions([]);
    setPinPos({ xRatio: 0.5, yRatio: 0.5 });
  };

  const handleCameraClick = async () => {
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert('Permission denied. Please allow camera access to use this feature.');
      setShowCameraModal(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            await handleFileSelect(file);
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            setShowCameraModal(false);
            setShowUploadModal(true);
          }
        }, 'image/jpeg');
      }
    }
  };

  const closeCameraModal = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setShowCameraModal(false);
  };

  const toggleOccasion = (occ: string) => {
    setOccasions(prev => prev.includes(occ) ? prev.filter(o => o !== occ) : [...prev, occ]);
  };

  const handleSaveItem = async () => {
    if (!previewImage) return;
    const id = Date.now().toString();
    const uploadedAt = Date.now();
    const formData = new FormData();
    formData.append('id', id);
    formData.append('gender', userGender);
    formData.append('type', type);
    formData.append('color', pickedColor);
    formData.append('colorName', pickedColorName);
    formData.append('occasions', occasions.join(','));
    formData.append('accessoryType', type === 'accessories' ? accessoryType : '');
    formData.append('uploadedAt', uploadedAt.toString());
    if (currentFile) formData.append('image', currentFile);
    else formData.append('image', previewImage);

    try {
      const res = await fetch('/api/wardrobe', { method: 'POST', body: formData });
      if (res.ok) {
        const savedItem = await res.json();
        setItems(prev => [savedItem, ...prev]);
        setShowUploadModal(false);
        setPreviewImage(null);
        setCurrentFile(null);
      } else {
        alert('Failed to save item');
      }
    } catch (error) {
      console.error('Upload Error:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/wardrobe/${id}`, { method: 'DELETE' });
      if (res.ok) setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Delete Error:', error);
    }
  };

  // Group items by type
  const grouped = categories.reduce((acc, cat) => {
    acc[cat.key] = items.filter(i => i.type === cat.key);
    return acc;
  }, {} as Record<string, ClothingItem[]>);

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar />

      <div className="flex-1 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl mb-2">My Wardrobe</h1>
              <p className="opacity-80">Manage your clothing collection</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleUploadClick}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <Upload className="w-5 h-5" />Upload
              </button>
              <button
                onClick={handleCameraClick}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
              >
                <Camera className="w-5 h-5" />Camera
              </button>
            </div>
          </div>

          {/* Categorised Wardrobe */}
          {items.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <p className="text-xl opacity-60 mb-4">Your wardrobe is empty</p>
              <p className="opacity-40">Upload or capture your first item to get started</p>
            </motion.div>
          ) : (
            categories.map((cat, catIdx) => {
              const catItems = grouped[cat.key] || [];
              if (catItems.length === 0) return null;
              return (
                <div key={cat.key}>
                  {catIdx > 0 && <hr className="border-white/15 my-6" />}
                  <h2 className="text-xl font-semibold mb-4 opacity-90">{cat.label}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <AnimatePresence>
                      {catItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="relative group"
                        >
                          <div className="aspect-square rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
                            <img src={item.image} alt={`${item.type} item`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                              style={{ backgroundColor: item.color }}
                              title={item.colorName || item.color}
                            />
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 rounded-full bg-red-500/80 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="mt-2 px-2">
                            <div className="text-sm opacity-80 capitalize">{item.type}</div>
                            {item.colorName && <div className="text-xs opacity-60 capitalize">{item.colorName}</div>}
                            {item.accessoryType && <div className="text-xs opacity-50">{item.accessoryType}</div>}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 my-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl">Add Item</h2>
                <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-full hover:bg-white/20 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!previewImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/30 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-white/5 transition-all"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 opacity-60" />
                  <p className="opacity-80">Click to upload image</p>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} className="hidden" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preview with color picker pin overlay */}
                  <div>
                    <label className="block mb-1 text-sm opacity-80">Pick Color — drag pin on image</label>
                    <div
                      ref={previewContainerRef}
                      className="relative rounded-xl overflow-hidden bg-white/5 cursor-crosshair select-none"
                      style={{ height: 180 }}
                      onMouseDown={handleOverlayMouseDown}
                      onTouchStart={handleOverlayTouchStart}
                    >
                      <img
                        ref={previewImgRef}
                        src={previewImage!}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onLoad={() => sampleFromImage(pinPos.xRatio, pinPos.yRatio)}
                        draggable={false}
                      />
                      {/* Transparent overlay to capture pointer events */}
                      <div className="absolute inset-0" />
                      {/* Movable pin */}
                      <div
                        className="absolute pointer-events-none z-10"
                        style={{
                          left: `${pinPos.xRatio * 100}%`,
                          top: `${pinPos.yRatio * 100}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full shadow-lg"
                          style={{
                            backgroundColor: pickedColor,
                            border: '2.5px solid white',
                            boxShadow: '0 0 0 1.5px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.5)',
                          }}
                        />
                      </div>
                    </div>
                    {/* Color result row */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-7 h-7 rounded-full border-2 border-white shadow-lg flex-shrink-0" style={{ backgroundColor: pickedColor }} />
                      <div>
                        <div className="text-sm font-semibold capitalize">{pickedColorName}</div>
                        <div className="text-xs opacity-60">{pickedColor}</div>
                      </div>
                    </div>
                  </div>

                  {/* Dress Type */}
                  <div>
                    <label className="block mb-2 text-sm opacity-80">Dress Type</label>
                    <select
                      value={type}
                      onChange={(e) => { setType(e.target.value); setAccessoryType(''); }}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none capitalize"
                    >
                      {typeOptions.map(t => (
                        <option key={t} value={t} className="bg-[#2a1a3e] text-white capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Accessory sub-dropdown */}
                  {type === 'accessories' && (
                    <div>
                      <label className="block mb-2 text-sm opacity-80">Accessory Type</label>
                      <select
                        value={accessoryType}
                        onChange={(e) => setAccessoryType(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none"
                      >
                        <option value="" className="bg-[#2a1a3e] text-gray-400">Select accessory type</option>
                        {accessoryOptions.map(a => (
                          <option key={a} value={a} className="bg-[#2a1a3e] text-white">{a}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Occasions */}
                  <div>
                    <label className="block mb-2 text-sm opacity-80">Occasions (select all that apply)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {OCCASION_OPTIONS.map(occ => (
                        <label key={occ} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={occasions.includes(occ)}
                            onChange={() => toggleOccasion(occ)}
                            className="w-4 h-4 accent-purple-500 cursor-pointer"
                          />
                          <span className="text-sm group-hover:opacity-100 opacity-80">{occ}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveItem}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Save to Wardrobe
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCameraModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-2xl">
              <div className="relative rounded-2xl overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                  <button onClick={capturePhoto} className="px-8 py-4 rounded-full bg-white text-black hover:bg-gray-200 transition-all font-semibold">
                    Capture Photo
                  </button>
                  <button onClick={closeCameraModal} className="px-8 py-4 rounded-full bg-red-500 hover:bg-red-600 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
