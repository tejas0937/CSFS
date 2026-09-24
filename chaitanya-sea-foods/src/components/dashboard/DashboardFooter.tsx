export default function DashboardFooter() {
  return (
    <footer className="mt-6 border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:px-10">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="font-black tracking-wide">CHAITANYA SEA FOODS SYNDICATE</h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Office No. V 990, APMC Market, Sector 19 Krushi Wholesale Mart, Turbhe, Navi Mumbai 400 703
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-sm font-black text-orange-400">Contact</p>
            <p className="mt-2 text-sm text-slate-300">8108990550</p>
            <p className="text-sm text-slate-300">9595505404</p>
          </div>
        </div>
        <div className="mt-7 border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Chaitanya Sea Foods Syndicate.
        </div>
      </div>
    </footer>
  );
}
