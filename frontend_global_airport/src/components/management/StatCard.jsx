export default function StatCard({ titulo, valor }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {titulo}
      </p>

      <p className="mt-2 text-3xl font-bold text-[#0C2D57]">
        {valor}
      </p>
    </div>
  );
}