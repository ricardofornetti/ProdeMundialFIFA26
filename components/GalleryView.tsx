
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ZoomIn, X, Award, Upload } from 'lucide-react';

interface GalleryImage {
  url: string;
  caption: string;
  type: 'logo' | 'mascot';
}

interface GalleryItem {
  year: number;
  host: string;
  images: GalleryImage[];
}

interface GalleryViewProps {
  onBack: () => void;
}

const GALLERY_DATA: GalleryItem[] = [
  {
    year: 2026,
    host: 'Canadá, México y EE.UU.',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/2026_FIFA_World_Cup_logo.svg/800px-2026_FIFA_World_Cup_logo.svg.png', caption: 'Logo Oficial de 2026', type: 'logo' },
      { url: 'https://digitalhub.fifa.com/transform/759763b5faef/launch-ENf264c4ce0fad4ce4bf7503fd7be51245.min.js', caption: 'Mascotas: Maple, Zayu y Clutch (Alce, Jaguar y Águila)', type: 'mascot' }
    ]
  },
  {
    year: 2022,
    host: 'Catar',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/2022_FIFA_World_Cup.svg/800px-2022_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de Catar 2022', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/La%27eeb_-_Qatar_2022_Mascot.png/800px-La%27eeb_-_Qatar_2022_Mascot.png', caption: 'Mascota: La\'eeb', type: 'mascot' }
    ]
  },
  {
    year: 2018,
    host: 'Rusia',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/67/2018_FIFA_World_Cup.svg/800px-2018_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de Rusia 2018', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/Zabivaka.png/800px-Zabivaka.png', caption: 'Mascota: Zabivaka', type: 'mascot' }
    ]
  },
  {
    year: 2014,
    host: 'Brasil',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/2014_FIFA_World_Cup.svg/800px-2014_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de Brasil 2014', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/Fuleco_the_Armadillo.png/800px-Fuleco_the_Armadillo.png', caption: 'Mascota: Fuleco', type: 'mascot' }
    ]
  },
  {
    year: 2010,
    host: 'Sudáfrica',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/10/2010_FIFA_World_Cup.svg/800px-2010_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de Sudáfrica 2010', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a1/Zakumi.png/800px-Zakumi.png', caption: 'Mascota: Zakumi', type: 'mascot' }
    ]
  },
  {
    year: 2006,
    host: 'Alemania',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/67/2006_FIFA_World_Cup.svg/800px-2006_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de Alemania 2006', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/Goleo_VI.png/800px-Goleo_VI.png', caption: 'Mascota: Goleo VI', type: 'mascot' }
    ]
  },
  {
    year: 2002,
    host: 'Corea-Japón',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ad/2002_FIFA_World_Cup.svg/800px-2002_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de Corea-Japón 2002', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b1/2002_FIFA_World_Cup_mascot.png/800px-2002_FIFA_World_Cup_mascot.png', caption: 'Mascotas: Los Spheriks (Ato, Kaz y Nik)', type: 'mascot' }
    ]
  },
  {
    year: 1998,
    host: 'Francia',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b2/1998_FIFA_World_Cup.svg/800px-1998_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de Francia 1998', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/Footix.png/800px-Footix.png', caption: 'Mascota: Footix', type: 'mascot' }
    ]
  },
  {
    year: 1994,
    host: 'Estados Unidos',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/1994_FIFA_World_Cup.svg/800px-1994_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de EE.UU. 1994', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Striker_the_World_Cup_Pup.png/800px-Striker_the_World_Cup_Pup.png', caption: 'Mascota: Striker', type: 'mascot' }
    ]
  },
  {
    year: 1990,
    host: 'Italia',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/1990_FIFA_World_Cup.svg/800px-1990_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de Italia 1990', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Ciao_mascot.png/800px-Ciao_mascot.png', caption: 'Mascota: Ciao', type: 'mascot' }
    ]
  },
  {
    year: 1986,
    host: 'México',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/1986_FIFA_World_Cup.svg/800px-1986_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de México 1986', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/Pique_mascot.png/800px-Pique_mascot.png', caption: 'Mascota: Pique', type: 'mascot' }
    ]
  },
  {
    year: 1982,
    host: 'España',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ad/1982_FIFA_World_Cup.svg/800px-1982_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de España 1982', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Naranjito_mascot.png/800px-Naranjito_mascot.png', caption: 'Mascota: Naranjito', type: 'mascot' }
    ]
  },
  {
    year: 1978,
    host: 'Argentina',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/1978_FIFA_World_Cup.svg/800px-1978_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de Argentina 1978', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Gauchito_mascot.png/800px-Gauchito_mascot.png', caption: 'Mascota: Gauchito', type: 'mascot' }
    ]
  },
  {
    year: 1974,
    host: 'Alemania Federal',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/1974_FIFA_World_Cup.svg/800px-1974_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de Alemania 1974', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/Tip_and_Tap.png/800px-Tip_and_Tap.png', caption: 'Mascotas: Tip y Tap', type: 'mascot' }
    ]
  },
  {
    year: 1970,
    host: 'México',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/1970_FIFA_World_Cup.svg/800px-1970_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de México 1970', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0e/Juanito_mascot.png/800px-Juanito_mascot.png', caption: 'Mascota: Juanito', type: 'mascot' }
    ]
  },
  {
    year: 1966,
    host: 'Inglaterra',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/1966_FIFA_World_Cup.svg/800px-1966_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de Inglaterra 1966', type: 'logo' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/World_Cup_Willie.png/800px-World_Cup_Willie.png', caption: 'Mascota: World Cup Willie', type: 'mascot' }
    ]
  },
  {
    year: 1962,
    host: 'Chile',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/1962_FIFA_World_Cup.svg/800px-1962_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de Chile 1962', type: 'logo' }
    ]
  },
  {
    year: 1958,
    host: 'Suecia',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/1958_FIFA_World_Cup_poster.jpg/800px-1958_FIFA_World_Cup_poster.jpg', caption: 'Póster Oficial de Suecia 1958', type: 'logo' }
    ]
  },
  {
    year: 1954,
    host: 'Suiza',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/1954_FIFA_World_Cup.svg/800px-1954_FIFA_World_Cup.svg.png', caption: 'Logo Oficial de Suiza 1954', type: 'logo' }
    ]
  },
  {
    year: 1950,
    host: 'Brasil',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/1950_FIFA_World_Cup_poster.jpg/800px-1950_FIFA_World_Cup_poster.jpg', caption: 'Póster Oficial de Brasil 1950', type: 'logo' }
    ]
  },
  {
    year: 1938,
    host: 'Francia',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/1938_FIFA_World_Cup_poster.jpg/800px-1938_FIFA_World_Cup_poster.jpg', caption: 'Póster Oficial de Francia 1938', type: 'logo' }
    ]
  },
  {
    year: 1934,
    host: 'Italia',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/1934_FIFA_World_Cup_poster.jpg/800px-1934_FIFA_World_Cup_poster.jpg', caption: 'Póster Oficial de Italia 1934', type: 'logo' }
    ]
  },
  {
    year: 1930,
    host: 'Uruguay',
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/1930_FIFA_World_Cup_poster.jpg/800px-1930_FIFA_World_Cup_poster.jpg', caption: 'Póster Oficial de Uruguay 1930', type: 'logo' }
    ]
  }
];

export const GalleryView: React.FC<GalleryViewProps> = ({ onBack }) => {
  const [items, setItems] = useState<GalleryItem[]>(GALLERY_DATA);
  const [selectedImg, setSelectedImg] = useState<GalleryImage | null>(null);

  // Cargar imágenes persistentes al montar el componente
  useEffect(() => {
    const loadPersistedImages = async () => {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const persistedData = await response.json();
          setItems(prev => prev.map(item => {
            if (persistedData[item.year]) {
              const newImages = [...item.images];
              Object.keys(persistedData[item.year]).forEach(idx => {
                const index = parseInt(idx);
                if (newImages[index]) {
                  newImages[index] = { ...newImages[index], url: persistedData[item.year][idx] };
                }
              });
              return { ...item, images: newImages };
            }
            return item;
          }));
        }
      } catch (error) {
        console.error("Error al cargar imágenes persistentes:", error);
      }
    };
    loadPersistedImages();
  }, []);

  const handleReplace = (year: number, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const url = event.target?.result as string;
        
        // Actualizar estado local
        setItems(prev => prev.map(item => {
          if (item.year === year) {
            const newImages = [...item.images];
            newImages[index] = { ...newImages[index], url };
            return { ...item, images: newImages };
          }
          return item;
        }));

        // Guardar en el servidor de forma permanente
        try {
          await fetch('/api/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ year, index, url })
          });
        } catch (error) {
          console.error("Error al guardar la imagen en el servidor:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Modal Pantalla Completa */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10"
            onClick={() => setSelectedImg(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              onClick={() => setSelectedImg(null)}
            >
              <X className="h-8 w-8" />
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="max-w-2xl w-full flex flex-col items-center gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`relative group overflow-hidden rounded-3xl shadow-2xl border border-white/10 aspect-[3/4] w-full max-w-md bg-white flex items-center justify-center p-6`}>
                <img 
                  src={selectedImg.url} 
                  alt={selectedImg.caption} 
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-contain`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const year = GALLERY_DATA.find(d => d.images.some(i => i.url === selectedImg.url))?.year || 2022;
                    target.src = `https://picsum.photos/seed/wc${year}/400/600`;
                  }}
                />
              </div>
              <p className="text-white text-sm sm:text-base font-medium text-center italic leading-relaxed max-w-2xl px-4">
                "{selectedImg.caption}"
              </p>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Official FIFA Heritage</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Galería */}
      <div className="mb-16 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b-4 border-black dark:border-white pb-12">
        <div className="flex-1">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white font-black text-xs sm:text-sm uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-2xl transition-all active:scale-95 mb-8"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Volver</span>
          </button>
          <h2 className="heading-font text-5xl sm:text-7xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter italic leading-none">Logos Históricos</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Identidad Visual Oficial de la Copa del Mundo • 1930 - 2026</p>
        </div>
      </div>

      {/* Grid de Galería */}
      <div className="space-y-32">
        {items.length > 0 ? (
          items.map((item) => (
            <motion.div 
              key={item.year}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="sticky top-28 z-30 flex items-center gap-4 mb-12 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md py-4">
                <span className="text-5xl sm:text-7xl font-black heading-font italic text-slate-900 dark:text-white">{item.year}</span>
                <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">{item.host}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Sede Oficial</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {item.images.map((img, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ y: -8 }}
                    className="group relative cursor-pointer bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 dark:border-slate-700 transition-all duration-500 flex flex-col"
                    onClick={() => setSelectedImg(img)}
                  >
                    <div className={`aspect-[3/4] overflow-hidden relative bg-slate-50 dark:bg-slate-900 flex items-center justify-center`}>
                      <div className="w-full h-full flex items-center justify-center p-4">
                        <div className="w-full h-full rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-700 border-4 border-white">
                          <img 
                            src={img.url} 
                            alt={img.caption}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://picsum.photos/seed/wc${item.year}${idx}/400/600`;
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-full transform scale-90 group-hover:scale-100 transition-transform">
                          <ZoomIn className="w-8 h-8 text-white" />
                        </div>
                      </div>
  
                      {/* Badge de Tipo */}
                      <div className="absolute top-6 right-6">
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2">
                          <Award className={`w-3 h-3 ${img.type === 'mascot' ? 'text-emerald-600' : 'text-indigo-600'}`} />
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                            {img.type === 'mascot' ? 'MASCOTA' : 'LOGO'}
                          </span>
                        </div>
                      </div>

                      {/* Botón de Reemplazo (Para todas las fotos) */}
                      <div className="absolute top-6 left-6 z-40" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => document.getElementById(`replace-${item.year}-${idx}`)?.click()}
                          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-2.5 rounded-full shadow-lg border border-white/20 hover:bg-indigo-600 hover:text-white transition-all group/btn"
                          title="Reemplazar Imagen"
                        >
                          <Upload className="w-4 h-4" />
                          <input 
                            type="file" 
                            id={`replace-${item.year}-${idx}`} 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleReplace(item.year, idx, e)}
                          />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-[1px] w-4 bg-indigo-600"></div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          FIFA WORLD CUP
                        </p>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200 font-bold leading-relaxed italic">
                        {img.caption}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] italic">No hay fotos disponibles en este momento</p>
          </div>
        )}
      </div>

      <div className="mt-40 py-24 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-[12px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.8em] mb-6 italic">
          EL ARTE DEL FÚTBOL • 1930 - 2026
        </p>
        <div className="flex items-center justify-center gap-8">
           <div className="h-[1px] w-24 bg-slate-200 dark:bg-slate-700"></div>
           <svg className="w-12 h-12 text-slate-200 dark:text-slate-700" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2L14.39 8.26H22L15.81 12.75L18.19 20L12 15.5L5.81 20L8.19 12.75L2 8.26H9.61L12 1Z" />
           </svg>
           <div className="h-[1px] w-24 bg-slate-200 dark:bg-slate-700"></div>
        </div>
      </div>
    </div>
  );
};
