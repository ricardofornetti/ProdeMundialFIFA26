
import React, { useState, useEffect, useRef } from 'react';
import { getGalleryCloudData, addGalleryCloudImage, deleteGalleryCloudImage } from '../services/firebaseService';

interface GalleryImage {
  id?: string;
  url: string;
  caption: string;
}

interface GalleryItem {
  year: number;
  host: string;
  images: GalleryImage[];
}

interface GalleryViewProps {
  onBack: () => void;
}

const INITIAL_GALLERY_DATA: GalleryItem[] = [
  {
    year: 2022,
    host: 'Catar',
    images: [
      { url: 'https://images.unsplash.com/photo-1671212040038-473a8d9d332f?q=80&w=1200&auto=format&fit=crop', caption: 'Emiliano "Dibu" Martínez realizando la atajada del siglo frente a Kolo Muani en el minuto 123.' },
      { url: 'https://images.unsplash.com/photo-1671206734368-24cc541d40ca?q=80&w=1200&auto=format&fit=crop', caption: 'Lionel Messi cumpliendo el sueño de toda una vida: Besando la Copa del Mundo en Catar 2022.' }
    ]
  },
  {
    year: 2018,
    host: 'Rusia',
    images: [
      { url: 'https://images.unsplash.com/photo-1541534741688-6078c64b5ca5?q=80&w=1200&auto=format&fit=crop', caption: 'La selección de Francia celebrando su segundo título bajo la lluvia de Moscú.' },
      { url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1200&auto=format&fit=crop', caption: 'Kylian Mbappé consagrándose como la nueva joya del fútbol mundial con solo 19 años.' }
    ]
  },
  {
    year: 2014,
    host: 'Brasil',
    images: [
      { url: 'https://images.unsplash.com/photo-1510051640316-cee39563ddab?q=80&w=1200&auto=format&fit=crop', caption: 'Mario Götze marcando el agónico gol que le dio a Alemania su cuarta estrella frente a Argentina.' },
      { url: 'https://images.unsplash.com/photo-1431324155629-1a6eda1dec2d?q=80&w=1200&auto=format&fit=crop', caption: 'James Rodríguez y su volea espectacular ante Uruguay, el mejor gol del torneo.' }
    ]
  },
  {
    year: 2010,
    host: 'Sudáfrica',
    images: [
      { url: 'https://images.unsplash.com/photo-1511886929837-399a8a11bcac?q=80&w=1200&auto=format&fit=crop', caption: 'Andrés Iniesta marcando el gol más importante de la historia de España en el minuto 116.' },
      { url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop', caption: 'Diego Forlán dominando la Jabulani, llevándose el Balón de Oro del torneo.' }
    ]
  },
  {
    year: 2006,
    host: 'Alemania',
    images: [
      { url: 'https://images.unsplash.com/photo-1631484013149-8080c558913b?q=80&w=1200&auto=format&fit=crop', caption: 'Fabio Cannavaro levantando la copa tras la victoria de Italia en los penales.' },
      { url: 'https://images.unsplash.com/photo-1628891438288-39da9573688b?q=80&w=1200&auto=format&fit=crop', caption: 'Zinedine Zidane retirándose del campo tras el incidente con Materazzi en su último partido.' }
    ]
  },
  {
    year: 2002,
    host: 'Corea-Japón',
    images: [
      { url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1200&auto=format&fit=crop', caption: 'Ronaldo Nazário con su icónico peinado tras marcar dos goles en la final contra Alemania.' },
      { url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop', caption: 'La decepción de Oliver Kahn tras su único error en todo el torneo.' }
    ]
  }
];

export const GalleryView: React.FC<GalleryViewProps> = ({ onBack }) => {
  const [galleryData, setGalleryData] = useState<GalleryItem[]>(INITIAL_GALLERY_DATA);
  const [selectedImg, setSelectedImg] = useState<GalleryImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{year: number, host: string} | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCloudPhotos();
  }, []);

  const loadCloudPhotos = async () => {
    const cloudPhotos = await getGalleryCloudData();
    const mergedData = INITIAL_GALLERY_DATA.map(item => {
      const itemCloudPhotos = cloudPhotos.filter(p => p.year === item.year);
      return {
        ...item,
        images: [...item.images, ...itemCloudPhotos.map(p => ({ id: p.id, url: p.url, caption: p.caption }))]
      };
    });
    setGalleryData(mergedData);
  };

  const handleDelete = async (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation();
    
    if (!photoId) return;

    if (window.confirm('¿Estás seguro de que quieres eliminar esta foto permanentemente?')) {
      try {
        // 1. Actualización optimista: quitar de la UI inmediatamente
        setGalleryData(prev => prev.map(item => ({
          ...item,
          images: item.images.filter(img => img.id !== photoId)
        })));
        
        // 2. Intentar borrar en la nube
        await deleteGalleryCloudImage(photoId);
        
        // 3. Recargar para sincronizar estado final
        await loadCloudPhotos();
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar la foto de la base de datos. Por favor, verifica tu conexión.");
        // Revertir cambios si falla
        await loadCloudPhotos();
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !uploadTarget) return;

    setIsUploading(true);
    await addGalleryCloudImage(uploadTarget.year, uploadTarget.host, newUrl, newCaption);
    await loadCloudPhotos();
    setIsUploading(false);
    setUploadTarget(null);
    setNewUrl('');
    setNewCaption('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Modal Pantalla Completa */}
      {selectedImg && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10 animate-fade-in"
          onClick={() => setSelectedImg(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            onClick={() => setSelectedImg(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div 
            className="max-w-5xl w-full flex flex-col items-center gap-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative group overflow-hidden rounded-[2rem] shadow-2xl border border-white/10">
              <img 
                src={selectedImg.url} 
                alt={selectedImg.caption} 
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <p className="text-white text-sm sm:text-lg font-medium text-center italic leading-relaxed max-w-3xl">
              "{selectedImg.caption}"
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">FIFA History™</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Subir Foto */}
      {uploadTarget && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="heading-font text-xl font-black text-slate-900 dark:text-white uppercase italic">Cargar Foto ({uploadTarget.year})</h3>
              <button onClick={() => setUploadTarget(null)} className="text-slate-400 hover:text-black dark:hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Imagen (URL o Archivo)</label>
                <input 
                  type="text" 
                  value={newUrl} 
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 outline-none transition-all font-bold text-sm"
                />
                <div className="relative">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-indigo-100 transition-all border-2 border-dashed border-indigo-200 dark:border-indigo-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Subir desde dispositivo
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción Breve</label>
                <textarea 
                  value={newCaption} 
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Ej: El gol de la victoria..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 outline-none transition-all font-bold text-sm h-20 resize-none"
                  maxLength={100}
                />
              </div>

              {newUrl && (
                <div className="aspect-video rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                  <img src={newUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              
              <button 
                type="submit"
                disabled={!newUrl || isUploading}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Cargando...' : 'Guardar Permanentemente'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header Galería */}
      <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b-4 border-black dark:border-white pb-6">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-3 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-xs sm:text-sm uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-2xl transition-all active:scale-95 mb-6"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>Volver</span>
          </button>
          <h2 className="heading-font text-4xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter italic">Galería</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Cronología de la Copa del Mundo</p>
        </div>
        
        <div className="hidden md:block">
           <svg className="w-12 h-12 text-slate-200 dark:text-slate-700" fill="currentColor" viewBox="0 0 24 24">
             <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm3 3h6v6H9V9z" />
           </svg>
        </div>
      </div>

      {/* Grid de Galería */}
      <div className="space-y-20">
        {galleryData.map((item) => (
          <section key={item.year} className="animate-fade-in group/section">
            <div className="flex items-center gap-6 mb-10">
              <div className="h-[2px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
              <div className="flex flex-col items-center gap-2">
                <h3 className="heading-font text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic group-hover/section:scale-110 transition-transform">
                  {item.year} • {item.host}
                </h3>
                <button 
                  onClick={() => setUploadTarget({year: item.year, host: item.host})}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                >
                  Cargar Foto
                </button>
              </div>
              <div className="h-[2px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {item.images.map((img, idx) => (
                <div 
                  key={idx} 
                  className="group relative cursor-pointer bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 dark:border-slate-700 hover:scale-[1.03] transition-all duration-500"
                  onClick={() => setSelectedImg(img)}
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img 
                      src={img.url} 
                      alt={img.caption}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                    
                    {/* Botón Eliminar (solo para fotos de la nube) */}
                    {img.id && (
                      <button 
                        onClick={(e) => handleDelete(e, img.id!)}
                        className="absolute top-4 right-4 z-20 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all active:scale-90 flex items-center justify-center"
                        title="Eliminar foto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8 bg-white dark:bg-slate-800">
                    <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed line-clamp-2">
                      "{img.caption}"
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
                       <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Fragmento de Historia</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Tarjeta para Cargar Foto */}
              <button 
                onClick={() => setUploadTarget({year: item.year, host: item.host})}
                className="group relative cursor-pointer bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] overflow-hidden shadow-inner border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 transition-all duration-500 flex flex-col items-center justify-center gap-4 min-h-[300px]"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </div>
                <div className="text-center">
                  <span className="block font-black uppercase text-xs tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">Cargar Foto</span>
                  <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">{item.year} • {item.host}</span>
                </div>
              </button>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-32 py-20 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-[11px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.6em] mb-4 italic">
          LA GLORIA ES ETERNA • 1930 - 2026
        </p>
        <div className="flex items-center justify-center gap-6">
           <div className="h-[1px] w-20 bg-slate-200 dark:bg-slate-700"></div>
           <svg className="w-10 h-10 text-slate-200 dark:text-slate-700" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2L14.39 8.26H22L15.81 12.75L18.19 20L12 15.5L5.81 20L8.19 12.75L2 8.26H9.61L12 1Z" />
           </svg>
           <div className="h-[1px] w-20 bg-slate-200 dark:bg-slate-700"></div>
        </div>
      </div>
    </div>
  );
};
