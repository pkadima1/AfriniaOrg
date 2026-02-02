const PAGE_HEADER_BG =
  'https://firebasestorage.googleapis.com/v0/b/modified-hull-203004.firebasestorage.app/o/Media%2Fabout1.png?alt=media&token=7ccaaeb4-f339-4e06-8cab-97d300d8c2aa';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => (
  <header className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${PAGE_HEADER_BG})` }}
    />
    <div className="absolute inset-0 bg-black/60" />
    <div className="relative z-10 pt-24 pb-16 px-6 lg:px-8 text-center animate-fade-in">
      <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xl md:text-2xl text-white/90 font-normal max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  </header>
);

export default PageHeader;
