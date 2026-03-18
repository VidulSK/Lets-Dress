import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Camera, X } from 'lucide-react';
import { AppNavbar } from '../components/AppNavbar';
import { Footer } from '../components/Footer';
import { getImageDominantColor } from '../utils/colorDetection';

interface ClothingItem {
  id: string;
  image: string;
  gender: string;
  type: 'top' | 'bottom' | 'footwear';
  color: string;
  uploadedAt: number;
}

export function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  
  useEffect(() => {
    fetch('/api/wardrobe')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(console.error);
  }, []);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [gender, setGender] = useState('male');
  const [type, setType] = useState<'top' | 'bottom' | 'footwear'>('top');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [detectedColor, setDetectedColor] = useState<string>('#808080');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);



  const handleFileSelect = async (file: File) => {
    setCurrentFile(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      setPreviewImage(imageUrl);
      
      // Detect color
      const color = await getImageDominantColor(file);
      setDetectedColor(color);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
    setPreviewImage(null);
    setDetectedColor('#808080');
  };

  const handleCameraClick = async () => {
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
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
            setCurrentFile(file);
            const imageUrl = canvas.toDataURL('image/jpeg');
            setPreviewImage(imageUrl);
            
            // Detect color
            const color = await getImageDominantColor(file);
            setDetectedColor(color);
            
            // Stop camera
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
            }
            setShowCameraModal(false);
            setShowUploadModal(true);
          }
        }, 'image/jpeg');
      }
    }
  };

  const closeCameraModal = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCameraModal(false);
  };

  const handleSaveItem = async () => {
    if (previewImage) {
      const id = Date.now().toString();
      const uploadedAt = Date.now();

      const formData = new FormData();
      formData.append('id', id);
      formData.append('gender', gender);
      formData.append('type', type);
      formData.append('color', detectedColor);
      formData.append('uploadedAt', uploadedAt.toString());
      
      if (currentFile) {
        formData.append('image', currentFile);
      } else {
        formData.append('image', previewImage);
      }

      try {
        const res = await fetch('/api/wardrobe', {
          method: 'POST',
          body: formData,
        });
        
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
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/wardrobe/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Delete Error:', error);
    }
  };

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
                <Upload className="w-5 h-5" />
                Upload
              </button>
              <button
                onClick={handleCameraClick}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
              >
                <Camera className="w-5 h-5" />
                Camera
              </button>
            </div>
          </div>

          {/* Wardrobe Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
                    <img
                      src={item.image}
                      alt={`${item.type} item`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                      style={{ backgroundColor: item.color }}
                      title={`Dominant color: ${item.color}`}
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
                    <div className="text-xs opacity-60 capitalize">{item.gender}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {items.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-xl opacity-60 mb-4">Your wardrobe is empty</p>
              <p className="opacity-40">Upload or capture your first item to get started</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl">Add Item</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 rounded-full hover:bg-white/20 transition-all"
                >
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Replace the preview block in your Upload Modal with this: */}
                  <div className="space-y-4"> {/* Increased spacing for better UI */}
                    <div className="flex justify-center">
                      <div className="relative w-60 h-60 rounded-xl overflow-hidden bg-white/10 border border-white/20 shadow-xl">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        {/* Optional: Add a small clear button to go back to upload state */}
                        <button 
                          onClick={() => setPreviewImage(null)}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/80 transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Color Detection Row - Adjusted for the new smaller layout */}
                    <div className="flex items-center justify-center gap-3 bg-white/5 py-2 rounded-lg">
                      <span className="text-xs uppercase tracking-wider opacity-60">Detected:</span>
                      <div
                        className="w-6 h-6 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: detectedColor }}
                      />
                      <span className="text-sm font-mono opacity-80">{detectedColor}</span>
                    </div>

                    {/* ... rest of your form (Gender/Type selects) ... */}
                  </div>

                  <div className="flex gap-4">
                  {/* Gender Select */}
                  <div className="flex-1">
                    <label className="block mb-2 text-sm opacity-80">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="" className="bg-[#D2C1B6] text-gray-400">Select</option>
                      <option value="male" className="bg-[#D2C1B6] text-white">Male</option>
                      <option value="female" className="bg-[#D2C1B6] text-white">Female</option>
                      <option value="other" className="bg-[#D2C1B6] text-white">Other</option>
                    </select>
                  </div>

                  {/* Type Select */}
                  <div className="flex-1">
                    <label className="block mb-2 text-sm opacity-80">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as 'top' | 'bottom' | 'footwear')}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="top" className="bg-[#D2C1B6] text-white">Top</option>
                      <option value="bottom" className="bg-[#D2C1B6] text-white">Bottom</option>
                      <option value="footwear" className="bg-[#D2C1B6] text-white">Footwear</option>
                    </select>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-2xl"
            >
              <div className="relative rounded-2xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                  <button
                    onClick={capturePhoto}
                    className="px-8 py-4 rounded-full bg-white text-black hover:bg-gray-200 transition-all font-semibold"
                  >
                    Capture Photo
                  </button>
                  <button
                    onClick={closeCameraModal}
                    className="px-8 py-4 rounded-full bg-red-500 hover:bg-red-600 transition-all"
                  >
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
