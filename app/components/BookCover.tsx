"use client";

type CoverProps = {
  title: string;
  summary: string;
  coverImage: string;
  date?: string;
  selected: boolean;
  onClick: () => void;
  template: "cine" | "revista" | "minimal";
};

export function CoverPreview({ title, coverImage, template, selected, onClick }: CoverProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl overflow-hidden transition-all ${
        selected ? "ring-4 ring-black scale-105" : "hover:scale-102 opacity-80 hover:opacity-100"
      }`}
    >
      {template === "cine" && (
        <div className="relative h-64 bg-black">
          <img src={coverImage} className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
            <p className="text-xs tracking-widest uppercase mb-3 opacity-70">Tramabook</p>
            <h2 className="text-2xl font-bold text-center leading-tight">{title}</h2>
            <div className="w-12 h-px bg-white mt-4 opacity-50" />
          </div>
        </div>
      )}

      {template === "revista" && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <img src={coverImage} className="w-full h-40 object-cover" />
          <div className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Tramabook</p>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{title}</h2>
          </div>
        </div>
      )}

      {template === "minimal" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4 items-center h-64">
          <div className="flex-1">
            <p className="text-xs text-gray-300 uppercase tracking-widest mb-2">Tramabook</p>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-3">{title}</h2>
            <div className="w-8 h-px bg-gray-300" />
          </div>
          <img src={coverImage} className="w-32 h-48 object-cover rounded-xl" />
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-2 pb-1">
        {template === "cine" ? "Cine" : template === "revista" ? "Revista" : "Minimalista"}
      </p>
    </div>
  );
}